// import { defineAbillityFor } from '.';
import { Action, defineAbillityFor, Module } from '@lotaria-nacional/lotto';
import { getUserPermissionsService } from '../features/auth/services/get-user-permissions-service';

export async function buildUserAbillity(userId: string) {
  const rawPermissions = await getUserPermissionsService(userId);

  const permissions = rawPermissions.map(p => ({
    action: p.action as Action[],
    feature: p.feature as Module,
  }));

  return defineAbillityFor(permissions);
}
