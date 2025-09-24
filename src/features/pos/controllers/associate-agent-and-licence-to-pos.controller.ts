import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { updatePosSchema } from '@lotaria-nacional/lotto';
import { idSchema } from '../../../schemas/common/id.schema';
import { associateAgentAndLicenceToPosService } from '../services/associate-agent-and-licence-to-pos-service';
import { hasPermission } from '../../../middleware/auth/permissions';

export async function associateAgentAndLicenceToPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'ASSOCIATE',
      subject: 'POS',
    },
  });

  const { id } = idSchema.parse(req.params);

  const body = updatePosSchema.parse({ ...req.body, id });

  await associateAgentAndLicenceToPosService({ ...body, user });

  return res.status(HttpStatus.OK).json({
    message: 'POS ativado',
  });
}
