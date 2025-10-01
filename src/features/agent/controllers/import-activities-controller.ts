import readline from 'readline';
import { Readable } from 'node:stream';
import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';

export async function importActivitiesController(req: Request, res: Response) {
  if (!req.file) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Ficheiro é obrigatório' });
  }

  const { buffer } = req.file;

  const readableFile = new Readable();
  readableFile.push(buffer);
  readableFile.push(null);

  const line = readline.createInterface({
    input: readableFile,
  });

  const data: AfrimoneyActivity[] = [];

  let isFirstLine = true;
  for await (let l of line) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    data.push({
      staffId: l.split(',')[3],
      staffName: l.split(',')[4],
      staffReference: l.split(',')[5],
      ggrAmmount: l.split(',')[11],
    });
  }

  console.log(data);

  return res.send();
}

type AfrimoneyActivity = {
  staffId: string;
  staffName: string;
  staffReference: string;
  ggrAmmount: string;
};
