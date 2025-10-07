import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { fetchActivitiesService } from '../services/fetch-activities-service';

export async function fetchActivitiesController(req: Request, res: Response) {
  const data = await fetchActivitiesService();
  return res.status(HttpStatus.OK).json(data);
}
