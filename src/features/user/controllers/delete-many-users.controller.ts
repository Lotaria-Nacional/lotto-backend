import type { Request, Response } from 'express';
import { deleteManyUsersService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { idsSchema } from '../../../schemas/common/id.schema';

export async function deleteManyUsersController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  const { ids } = idsSchema.parse(req.body);

  await deleteManyUsersService(ids, user);

  return res.status(HttpStatus.OK).json({
    message: 'Usuários removidos',
  });
}
