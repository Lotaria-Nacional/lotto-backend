import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { idSchema } from '../../../schemas/common/id.schema';
import { markTerminalAsFixedService } from '../services/mark-terminal-as-fixed.service';

export async function markTerminalAsFixedController(req: Request, res: Response) {
  // const user = req.user as AuthPayload;

  const { id } = idSchema.parse(req.params);

  await markTerminalAsFixedService(id);

  return res.status(HttpStatus.OK).json({
    message: 'O terminal foi concertado',
  });
}
