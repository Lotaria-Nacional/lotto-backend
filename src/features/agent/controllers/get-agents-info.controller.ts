import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { getAgentsInfoService } from '../services/get-agents-info-service';

export async function getAgentsInfoController(req: Request, res: Response) {
  const response = await getAgentsInfoService();

  return res.status(HttpStatus.OK).json(response);
}
