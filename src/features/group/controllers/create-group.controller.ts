import type { Response, Request } from 'express';
import { createGroupService } from '../services/create-group.service';
import { HttpStatus } from '../../../constants/http';
import { AuthPayload, createGroupSchema } from '@lotaria-nacional/lotto';
import { hasPermission } from '../../../middleware/auth/permissions';

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

  const response = await createGroupService(body);

  return res.status(HttpStatus.CREATED).json({ id: response });
}
