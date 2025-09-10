import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { deleteManyLicencesService } from '../services';
import { AuthPayload } from '../../../@types/auth-payload';
import { idsSchema } from '../../../schemas/common/id.schema';

export async function deleteManyLicencesController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const { ids } = idsSchema.parse(req.body);

  await deleteManyLicencesService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Licenças removidas',
  });
}
