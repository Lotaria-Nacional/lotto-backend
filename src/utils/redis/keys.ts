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
        delivery_date,
        area_name = 'all',
        zone_number = 'all',
        city_name = 'all',
        agent_id_reference = 'all',
        province_name = 'all',
      } = params;

      return `terminals:${limit}:page:${page}:query:${query}:delivery_date:${delivery_date}:area:${area_name}:zone:${zone_number}:province:${province_name}:city:${city_name}:agent:${agent_id_reference}`;
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
        area_name = 'all',
        zone_number = 'all',
        city_name = 'all',
        type_name = 'all',
        province_name = 'all',
      } = params;

      return `agents:${limit}:${training_date}:page:${page}:query:${query}:type:${type_name}:area:${area_name}:zone:${zone_number}:status:${status}:city:${city_name}:province:${province_name}`;
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
        area_name = 'all',
        zone_number = 'all',
        city_name = 'all',
        type_name = 'all',
        admin_name = 'all',
        subtype_name = 'all',
        province_name = 'all',
      } = params;

      return `pos:${limit}:page:${page}:query:admin_name:${admin_name}:${query}:type:${type_name}:subtype${subtype_name}:area:${area_name}:zone:${zone_number}:city:${city_name}:province:${province_name}`;
    },
  },

  licences: {
    all: () => 'licences:*',
    byId: (id: string) => `licences:${id}`,
    listWithFilters: (params: PaginationParams) => {
      const { limit, page, query, admin_name } = params;
      return `licences:${limit}:page:${page}:query:${query}:admin_name${admin_name}`;
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
