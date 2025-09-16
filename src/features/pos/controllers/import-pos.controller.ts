import fs from 'fs';
import { Request, Response } from 'express';
import { importPosFromFileService } from '../services/import-pos-sevice';

export async function importPosController(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'Arquivo não enviado' });
  }

  try {
    const importedPOS = await importPosFromFileService(req.file);
    fs.unlinkSync(req.file.path); // remove arquivo temporário

    return res.status(200).json({
      message: 'Importação concluída',
      total: importedPOS.length,
      data: importedPOS,
    });
  } catch (err) {
    fs.unlinkSync(req.file.path);
    console.error(err);
    return res.status(500).json({ message: 'Erro ao importar POS' });
  }
}
