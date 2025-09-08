import { Request, Response } from 'express';
import { parseCsvTerminals, parseExcelTerminals } from '../utils/parser';
import { uploadTerminalsService } from '../services/upload-terminal-service';

export async function uploadTerminalsController(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ficheiro é obrigatório' });
    }

    let data;
    if (req.file.originalname.endsWith('.csv')) {
      data = await parseCsvTerminals(req.file.path);
    } else if (req.file.originalname.endsWith('.xlsx')) {
      data = await parseExcelTerminals(req.file.path);
    } else {
      return res.status(400).json({ error: 'Formato inválido (use CSV ou Excel)' });
    }

    const result = await uploadTerminalsService(data);

    return res.json({ result, message: 'Terminais carregados com sucesso' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
