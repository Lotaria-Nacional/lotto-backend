import type { Request, Response } from 'express';
import { idSchema } from '../../../schemas/common/id.schema';
import { deleteSimCardService } from '../services';
import { HttpStatus } from '../../../constants/http';

export async function deleteSimCardController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);
  const response = await deleteSimCardService(id);

  return res.status(HttpStatus.OK).json({ message: 'Sim card removido com sucesso', id: response.id });
}
