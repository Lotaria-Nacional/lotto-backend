import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { importSimCardsFromCsvService } from '../services/import-sim-cards.service';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function importSimCardsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'SIM_CARD',
    },
  });

  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Ficheiro é obrigatório' });

  const filePath = req.file.path;

  const result = await importSimCardsFromCsvService(filePath, user);

  res.status(HttpStatus.OK).json({ result, message: 'Sim cards importados com sucesso.' });
}
