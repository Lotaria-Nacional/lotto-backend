import { CloudflareR2 } from '../utils/cloudflare-r2';
import { upload } from './agent/routes';
import { Router, type Response, type Request } from 'express';

const uploadFileToR2Router = Router();

const uploadFileToR2Service = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const r2 = new CloudflareR2();
    const key = `images/${file.originalname}`;

    const response = await r2.PUT(file.buffer, key, file.mimetype);

    return res.status(200).json({
      message: `Ficheiro ${key} guardado com sucesso.`,
      r2_key: key,
      url: `${process.env.CLOUDFLARE_R2_BASEURL}/files/${key}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao enviar ficheiro para R2' });
  }
};

uploadFileToR2Router.put('/', upload.single('file'), uploadFileToR2Service);

export default uploadFileToR2Router;
