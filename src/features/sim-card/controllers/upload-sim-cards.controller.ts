import { Request, Response } from 'express';
import { uploadSimCardsService } from '../services/upload-sim-cards.service';
import { parseCsvSimCards, parseExcelSimCards } from '../utils/parser';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { HttpStatus } from '../../../constants/http';

export async function uploadSimCardsController(req: Request, res: Response) {
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

  let data;
  if (req.file.originalname.endsWith('.csv')) {
    data = await parseCsvSimCards(req.file.path);
  } else if (req.file.originalname.endsWith('.xlsx')) {
    data = await parseExcelSimCards(req.file.path);
  } else {
    return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Formato inválido (use CSV ou Excel)' });
  }

  const result = await uploadSimCardsService(data);

  res.status(HttpStatus.OK).json({ result, message: 'Sim cards carregados com sucesso' });
}
