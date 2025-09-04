import type { Request, Response } from 'express';
import { AuthPayload } from '../../../@types/auth-payload';
import { HttpStatus } from '../../../constants/http';
import { boundedBoxSchema } from '../schemas/bounds';
import { fecthBoundedPosService } from '../services/fetch-bounded-pos-service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function fetchBoundedPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'READ',
      subject: 'Pos',
    },
  });

  const bounds = boundedBoxSchema.parse(req.query);
  const response = await fecthBoundedPosService(bounds);
  return res.status(HttpStatus.OK).json(response);
}
