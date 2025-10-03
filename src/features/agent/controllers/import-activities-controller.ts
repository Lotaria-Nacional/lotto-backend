import { Request, Response } from 'express';
import { importActitiviesService } from '../services/import-activities-service';
import { v4 as uuidv4 } from 'uuid';
import { getProgress, setProgress } from '../../../utils/progress-store';

export async function uploadActivitiesController(req: Request, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum ficheiro fornecido' });
  }

  const uploadId = uuidv4();
  setProgress(uploadId, 0);

  // Processamento em background (não bloqueia a resposta HTTP)
  (async () => {
    try {
      await importActitiviesService(files, (percent) => {
        setProgress(uploadId, percent);
      });
      setProgress(uploadId, 100);
    } catch (error) {
      setProgress(uploadId, -1); // indica erro
    }
  })();

  return res.json({ uploadId });
}

// Endpoint de polling
export async function getProgressController(req: Request, res: Response) {
  const { uploadId } = req.params;
  const progress = getProgress(uploadId);

  if (progress === undefined) {
    return res.status(404).json({ error: 'Upload não encontrado' });
  }

  res.json({ progress });
}
