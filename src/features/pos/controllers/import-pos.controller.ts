import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';
import { importPosFromCsvService } from '../services/import-pos-sevice';

export async function importPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'POS',
    },
  });

  if (!req.file) {
    return res.status(400).json({ message: 'Arquivo não enviado' });
  }

  const filePath = req.file.path;

  const result = await importPosFromCsvService(filePath, user);

  const totalRows = result.imported + result.errors.length;

  if (result.errors.length === 0) {
    return res.status(HttpStatus.OK).json({
      message: `Todos os ${result.imported} POS foram importados com sucesso.`,
      imported: result.imported,
    });
  } else if (result.imported > 0) {
    return res.status(HttpStatus.OK).json({
      message: `Foram importados ${result.imported} POS com sucesso, mas alguns não foram inseridos devido a campos inválidos ou em falta.`,
      imported: result.imported,
      errors: result.errors,
      totalRows,
    });
  } else {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Nenhum POS foi importado. Todos os registros possuem erros.',
      imported: result.imported,
      errors: result.errors,
      totalRows,
    });
  }
}
