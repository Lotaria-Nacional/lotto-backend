import { createPosService } from '../services';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { createPosSchema } from '../schemas/create-pos.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function createPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'CREATE',
  //     subject: 'Pos',
  //   },
  // });

  const body = createPosSchema.parse({ ...req.body, user });
  const response = await createPosService(body);

  return res.status(HttpStatus.CREATED).json({
    message: 'Pos criado com sucesso',
    id: response,
  });
}
