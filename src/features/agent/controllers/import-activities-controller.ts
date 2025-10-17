import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { getProgress, setProgress } from '../../../utils/progress-store';
import { importActivitiesService } from '../services/import-activities-service';
import { AuthPayload } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function uploadActivitiesController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'IMPORT',
      subject: 'AGENT',
    },
  });

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum ficheiro fornecido' });
  }

  const uploadId = uuidv4();
  setProgress(uploadId, 0);

  // Processamento em background (não bloqueia a resposta HTTP)
  (async () => {
    try {
      await importActivitiesService(files, user);
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
