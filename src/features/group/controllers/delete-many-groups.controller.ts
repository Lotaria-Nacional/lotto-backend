import { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { deleteManyGroupsService } from '../services';
import { idsSchema } from '../../../schemas/common/id.schema';

export async function deleteManyGroupsController(req: Request, res: Response) {
  const { ids } = idsSchema.parse(req.body);

  await deleteManyGroupsService(ids);

  return res.status(HttpStatus.OK).json({ message: 'Grupo removidos com sucesso' });
}
