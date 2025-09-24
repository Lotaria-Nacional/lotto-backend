import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { reScheduleTrainingService } from '../services';
import { AuthPayload } from '../../../@types/auth-payload';
import { updateAgentSchema } from '@lotaria-nacional/lotto';
import { idSchema } from '../../../schemas/common/id.schema';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function reScheduleTrainingController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'RESCHEDULE',
      subject: 'AGENT',
    },
  });

  const { id } = idSchema.parse(req.params);
  const body = updateAgentSchema.parse({ ...req.body, id });

  await reScheduleTrainingService(body, user);

  return res.status(HttpStatus.OK).json({
    message: 'O agente foi re-agendado com sucesso!',
  });
}
