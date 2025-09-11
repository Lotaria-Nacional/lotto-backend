import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload, boundedBoxSchema } from '@lotaria-nacional/lotto';
import { fecthBoundedPosService } from '../services/fetch-bounded-pos-service';

export async function fetchBoundedPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'READ',
  //     subject: 'POS',
  //   },
  // });

  const bounds = boundedBoxSchema.parse(req.query);

  const response = await fecthBoundedPosService(bounds);

  return res.status(HttpStatus.OK).json(response);
}
