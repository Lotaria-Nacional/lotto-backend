import { Request, Response } from 'express';
import { uploadLicencesService } from '../services/upload-licences-sevice';
import { parseCsvLicences, parseExcelLicences } from '../utils/parser';

export async function uploadLicencesController(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Ficheiro é obrigatório' });

    let data;
    if (req.file.originalname.endsWith('.csv')) {
      data = await parseCsvLicences(req.file.path);
    } else if (req.file.originalname.endsWith('.xlsx')) {
      data = await parseExcelLicences(req.file.path);
    } else {
      return res.status(400).json({ error: 'Formato inválido (use CSV ou Excel)' });
    }

    const result = await uploadLicencesService(data);

    return res.json({ result, message: 'Licenças carregadas com sucesso' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
