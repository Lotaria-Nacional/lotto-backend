import { Request, Response } from 'express';
import { parseCsvAgents, parseExcelAgents } from '../utils/parser';
import { uploadAgentsService } from '../services/upload-agents.service';

export async function uploadAgentsController(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Ficheiro é obrigatório' });

    let data;
    if (req.file.originalname.endsWith('.csv')) {
      data = await parseCsvAgents(req.file.path);
    } else if (req.file.originalname.endsWith('.xlsx')) {
      data = await parseExcelAgents(req.file.path);
    } else {
      return res.status(400).json({ error: 'Formato inválido (use CSV ou Excel)' });
    }

    const result = await uploadAgentsService(data);

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
