import z from 'zod';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { deleteManyTerminalService } from '../services';
import { AuthPayload } from '../../../@types/auth-payload';
import { idsSchema } from '../../../schemas/common/id.schema';

export async function deleteManyTerminalsController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'DELETE',
  //     subject: 'Terminals',
  //   },
  // });

  const { ids } = idsSchema.parse(req.body);

  await deleteManyTerminalService(ids);

  return res.status(HttpStatus.OK).json({
    message: 'Terminais removidos com sucesso',
  });
}
