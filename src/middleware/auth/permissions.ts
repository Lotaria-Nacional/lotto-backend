import { HttpStatus } from '../../constants/http';
import type { Response } from 'express';
import { Actions, Subjects } from '../../permissions';
import { buildUserAbillity } from '../../permissions/build-abillity';
import { BadRequestError, ForbiddenError } from '../../errors';

type HasPermisisonsProps = {
  userId: string;
  res: Response;
  permission: { subject: Subjects; action: Actions };
};

export async function hasPermission({ permission, res, userId }: HasPermisisonsProps) {
  const ability = await buildUserAbillity(userId);

  if (!ability.can(permission.action, permission.subject)) {
    throw new ForbiddenError('Você não tem permissão');
  }
}
