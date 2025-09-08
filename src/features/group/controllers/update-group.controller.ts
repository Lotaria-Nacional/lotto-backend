import { Request, Response } from 'express';
import { idSchema } from '../../../schemas/common/id.schema';
import { updateGroupService } from '../services';
import { HttpStatus } from '../../../constants/http';
import { updateGroupSchema } from '@lotaria-nacional/lotto';

export async function updateGroupController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);
  const body = updateGroupSchema.parse({ ...req.body, id });
  const response = updateGroupService(body);

  return res.status(HttpStatus.OK).json({ message: 'Grupo atualizado com sucesso', id: response });
}
