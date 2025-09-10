import { Actions, defineAbillityFor, Subjects } from '.';
import { getUserPermissionsService } from '../features/auth/services/get-user-permissions.service';

export async function buildUserAbillity(userId: string) {
  const rawPermissions = await getUserPermissionsService(userId);

  const permissions = rawPermissions.map(p => ({
    action: p.action as Actions[],
    feature: p.module as Subjects,
  }));

  return defineAbillityFor(permissions);
}
