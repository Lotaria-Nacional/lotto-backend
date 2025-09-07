import { Request, Response } from 'express';
import { idSchema } from '../../../schemas/common/id.schema';
import { deleteGroupService } from '../services';
import { HttpStatus } from '../../../constants/http';

export async function deleteGroupController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);

  await deleteGroupService(id);

  return res.status(HttpStatus.OK).json({ message: 'Grupo removido com sucesso' });
}
