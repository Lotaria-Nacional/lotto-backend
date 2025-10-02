import { Request, Response } from 'express';
import { importActitiviesService } from '../services/import-activities-service';

export async function uploadActivitiesController(req: Request, res: Response) {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum ficheiro fornecido' });
  }

  const data = await importActitiviesService(files);
  return res.json(data);
}
