import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { getTerminalsInfoService } from '../services/get-terminals-info-service';

export async function getTerminalsInfoController(req: Request, res: Response) {
  const response = await getTerminalsInfoService();

  return res.status(HttpStatus.OK).json(response);
}
