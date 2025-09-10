import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { fecthBoundedPosService } from '../services/fetch-bounded-pos-service';
import { hasPermission } from '../../../middleware/auth/permissions';
import { AuthPayload } from '@lotaria-nacional/lotto';

export async function fetchBoundedPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'READ',
      subject: 'POS',
    },
  });

  const response = await fecthBoundedPosService();

  return res.status(HttpStatus.OK).json(response);
}
