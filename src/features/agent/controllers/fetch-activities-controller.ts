import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { fetchActitiviesService } from '../services/fetch-activities-service';

export async function fetchActivitiesController(req: Request, res: Response) {
  const data = await fetchActitiviesService();
  return res.status(HttpStatus.OK).json(data);
}
