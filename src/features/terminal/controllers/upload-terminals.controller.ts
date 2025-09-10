import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { parseCsvTerminals, parseExcelTerminals } from '../utils/parser';
import { uploadTerminalsService } from '../services/upload-terminal-service';

export async function uploadTerminalsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'TERMINAL',
    },
  });

  if (!req.file) {
    return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Ficheiro é obrigatório' });
  }

  let data;
  if (req.file.originalname.endsWith('.csv')) {
    data = await parseCsvTerminals(req.file.path);
  } else if (req.file.originalname.endsWith('.xlsx')) {
    data = await parseExcelTerminals(req.file.path);
  } else {
    return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Formato inválido (use CSV ou Excel)' });
  }

  const result = await uploadTerminalsService(data);

  return res.status(HttpStatus.OK).json({ result, message: 'Terminais carregados com sucesso' });
}
