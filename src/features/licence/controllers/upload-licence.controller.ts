import { Request, Response } from 'express';
import { uploadLicencesService } from '../services/upload-licences-sevice';
import { parseCsvLicences, parseExcelLicences } from '../utils/parser';
import { HttpStatus } from '../../../constants/http';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function uploadLicencesController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'LICENCE',
    },
  });

  if (!req.file) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Ficheiro é obrigatório' });

  let data;
  if (req.file.originalname.endsWith('.csv')) {
    data = await parseCsvLicences(req.file.path);
  } else if (req.file.originalname.endsWith('.xlsx')) {
    data = await parseExcelLicences(req.file.path);
  } else {
    return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Formato inválido (use CSV ou Excel)' });
  }

  const result = await uploadLicencesService(data);

  return res.status(HttpStatus.OK).json({ result, message: 'Upload feito com sucesso' });
}
