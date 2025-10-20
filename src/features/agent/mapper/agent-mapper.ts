import { Agent, AgentStatus, AgentType, Genre } from '@lotaria-nacional/lotto';

interface AgentToAudit {
  Nome: string;
  Sobrenome: string;
  Genero: Genre;
  Bilhete_de_identidade: string;
  Telefone: string;
  Afrimoney?: string;
  Tipo: AgentType;
  Estado: string;
  Data_de_formacao?: Date;
  Data_de_aprovacao?: Date;
  Data_de_criacao?: Date;
  Terminal?: string;
  Pos?: string;
}

export class AgentMapper {
  constructor() {}

  static toAuditLog(agent: Agent): AgentToAudit {
    return {
      Nome: agent.first_name,
      Sobrenome: agent.last_name,
      Genero: agent.genre,
      Bilhete_de_identidade: agent.bi_number,
      Telefone: agent.phone_number,
      Afrimoney: agent.afrimoney_number,
      Estado: this.formatStatus(agent.status),
      Tipo: agent.agent_type,
      Data_de_aprovacao: agent.approved_at,
      Data_de_formacao: agent.training_date,
      Data_de_criacao: agent.created_at,
      Pos: agent?.pos?.coordinates,
      Terminal: agent?.terminal?.serial,
    };
  }

  private static formatStatus(status: AgentStatus): string {
    const map: Record<AgentStatus, string> = {
      active: 'Ativo',
      approved: 'Apto',
      blocked: 'Bloqueado',
      denied: 'Negado',
      discontinued: 'Descontinuado',
      disapproved: 'Reprovado',
      ready: 'Pronto',
      scheduled: 'Agendado',
    };
    return map[status];
  }
}
