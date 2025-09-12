import { Request, Response } from 'express';
import { parseCsvAgents, parseExcelAgents } from '../utils/parser';
import { uploadAgentsService } from '../services/upload-agents.service';
import { HttpStatus } from '../../../constants/http';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function uploadAgentsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'AGENT',
    },
  });

  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Ficheiro é obrigatório' });

  let data;
  if (req.file.originalname.endsWith('.csv')) {
    data = await parseCsvAgents(req.file.path);
  } else if (req.file.originalname.endsWith('.xlsx')) {
    data = await parseExcelAgents(req.file.path);
  } else {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Formato inválido (use CSV ou Excel)' });
  }

  const result = await uploadAgentsService(data, user);

  return res.status(HttpStatus.OK).json({ result, message: 'Upload feito com sucesso' });
}
