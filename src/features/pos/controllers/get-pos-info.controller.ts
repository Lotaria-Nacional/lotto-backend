import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { getPosInfoService } from '../services/get-pos-infos-service';

export async function getPosInfoController(req: Request, res: Response) {
  const response = await getPosInfoService();

  return res.status(HttpStatus.OK).json(response);
}
