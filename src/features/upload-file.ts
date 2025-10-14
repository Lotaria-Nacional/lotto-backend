import { upload } from './agent/routes';
import { CloudflareR2 } from '../utils/cloudflare-r2';
import { Router, type Response, type Request } from 'express';

const uploadFileToR2Router = Router();

uploadFileToR2Router.put('/', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const r2 = new CloudflareR2();
    const mimetype = file.mimetype.split('/')[0].trim();
    const key = mimetype.concat(`/${file.originalname}`).trim();

    const response = await r2.PUT(file.buffer, key, file.mimetype);

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao enviar ficheiro para R2' });
  }
});

uploadFileToR2Router.get(/^\/(.+)/, async (req, res) => {
  const key = req.params[0];
  if (!key) return res.status(400).json({ error: 'No key provided' });

  try {
    const r2 = new CloudflareR2();
    const response = await r2.GET(key);
    res.setHeader('Content-Type', response.contentType);
    res.status(200).send(Buffer.from(response.data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter ficheiro do R2' });
  }
});

uploadFileToR2Router.delete(/^\/(.+)/, async (req: Request, res: Response) => {
  const key = req.params[0];
  if (!key) return res.status(400).json({ error: 'No key provided' });

  try {
    const r2 = new CloudflareR2();
    const response = await r2.DELETE(key);

    return res.status(200).json(response); // já vem em JSON
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao eliminar ficheiro do R2' });
  }
});

export default uploadFileToR2Router;
