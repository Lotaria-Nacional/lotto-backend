import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { fetchActivitiesService } from '../services/fetch-activities-service';
import z from 'zod';

const paramsSchema = z.object({
  query: z.string().optional(),
  date: z.string().optional(),
});

export type FetchActivitiesParams = z.infer<typeof paramsSchema>;

export async function fetchActivitiesController(req: Request, res: Response) {
  const params = paramsSchema.parse(req.query);

  const data = await fetchActivitiesService(params);
  return res.status(HttpStatus.OK).json(data);
}
