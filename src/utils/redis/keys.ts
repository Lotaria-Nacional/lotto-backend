import { AgentStatus } from '@prisma/client';
import { PaginationParams } from '../../@types/pagination-params';

export const RedisKeys = {
  terminals: {
    all: () => 'terminals:*',
    byId: (id: string) => `terminals:${id}`,
    listWithFilters: (params: PaginationParams) => {
      const {
        limit,
        page,
        query,
        status,
        delivery_date,
        area_id = 'all',
        zone_id = 'all',
        city_id = 'all',
        agent_id = 'all',
        province_id = 'all',
      } = params;

      return `terminals:${limit}:page:${page}:query:${query}:delivery_date:${delivery_date}:area:status:${status}:${area_id}:zone:${zone_id}:province:${province_id}:city:${city_id}:agent:${agent_id}`;
    },
  },

  agents: {
    all: () => 'agents:*',
    byId: (id: string) => `agents:${id}`,
    listWithFilters: (params: PaginationParams) => {
      const {
        limit,
        page,
        query,
        status,
        training_date,
        area_id = 'all',
        zone_id = 'all',
        city_id = 'all',
        type_id = 'all',
        province_id = 'all',
      } = params;

      return `agents:${limit}:${training_date}:page:${page}:query:${query}:type:${type_id}:area:${area_id}:zone:${zone_id}:status:${status}:city:${city_id}:province:${province_id}`;
    },
  },

  pos: {
    all: () => 'pos:*',
    byId: (id: string) => `pos:${id}`,
    listWithFilters: (params: PaginationParams) => {
      const {
        limit,
        page,
        query,
        status,
        area_id = 'all',
        zone_id = 'all',
        city_id = 'all',
        type_id = 'all',
        admin_id = 'all',
        subtype_id = 'all',
        province_id = 'all',
      } = params;

      return `pos:${limit}:page:${page}:query:status${status}:admin_id:${admin_id}:${query}:type:${type_id}:subtype${subtype_id}:area:${area_id}:zone:${zone_id}:city:${city_id}:province:${province_id}`;
    },
  },

  licences: {
    all: () => 'licences:*',
    byId: (id: string) => `licences:${id}`,
    listWithFilters: (params: PaginationParams) => {
      const { limit, page, query, admin_id } = params;
      return `licences:${limit}:page:${page}:query:${query}:admin_id${admin_id}`;
    },
  },

  auditLogs: {
    all: () => 'auditLogs:*',
    byId: (id: string) => `auditLogs:${id}`,
  },

  users: {
    all: () => 'users:*',
    byId: (id: string) => `users:${id}`,
    listWithFilters: (params: PaginationParams) => {
      const { limit, page, query } = params;
      return `users:${limit}:page:${page}:query:${query}`;
    },
  },

  admins: {
    all: () => 'admins:*',
  },
  areas: {
    all: () => 'areas:*',
  },
  provinces: {
    all: () => 'provinces:*',
  },
  types: {
    all: () => 'types:*',
  },
};
