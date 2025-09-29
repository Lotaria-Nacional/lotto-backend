import type { Response, Request } from 'express';
import { HttpStatus } from '../../../constants/http';
import { hasPermission } from '../../../middleware/auth/permissions';
import { createGroupService } from '../services/create-group-service';
import { AuthPayload, createGroupSchema } from '@lotaria-nacional/lotto';

export async function createGroupController(req: Request, res: Response) {
  const user = req.user as AuthPayload;

  await hasPermission({
    res,
    userId: user.id,
    permission: {
      action: 'CREATE',
      subject: 'GROUP',
    },
  });

  const body = createGroupSchema.parse(req.body);

  const response = await createGroupService(body, user);

  return res.status(HttpStatus.CREATED).json({ id: response });
}
