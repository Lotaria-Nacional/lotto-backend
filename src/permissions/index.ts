import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { Action, Module } from '@lotaria-nacional/lotto';

export type Actions = Action | 'manage';
export type Subjects = Module | 'all';

export type AppAbillity = MongoAbility<[Actions, Subjects]>;

export function defineAbillityFor(permissions: Array<{ action: Actions[]; feature: Subjects }>) {
  const { can, build } = new AbilityBuilder<AppAbillity>(createMongoAbility);

  for (const perm of permissions) {
    can(perm.action, perm.feature);
  }

  return build();
}
