import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload } from '../../../@types/auth-payload';
import { updatePosSchema } from '../schemas/update.schema';
import { idSchema } from '../../../schemas/common/id.schema';
import { associateAgentAndLicenceToPosService } from '../services/associate-agent-and-licence-to-pos.service';

export async function associateAgentAndLicenceToPosController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  // await hasPermission({
  //   res,
  //   userId: user.id,
  //   permission: {
  //     action: 'UPDATE',
  //     subject: 'Pos',
  //   },
  // });

  const { id } = idSchema.parse(req.params);
  const body = updatePosSchema.parse({ ...req.body, id, user });

  await associateAgentAndLicenceToPosService(body);

  return res.status(HttpStatus.OK).json({
    message: 'POS ativado',
  });
}
