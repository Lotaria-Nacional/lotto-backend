export interface Activity {
  debt: string; // valor de dívida (ex.: GGR_AMOUNT no Koral)
  deposit: string; // valor de depósito (ex.: TRANSFER_VALUE no Afrimoney)
  balance: string; // diferença entre deposit e debt
  date?: string; // diferença entre deposit e debt
}

export interface AgentActivity {
  agentId: string; // vem de REMARKS (Afrimoney) ou STAFFREFERENCE (Koral)
  area: string; // por enquanto vazio, mas preparado para uso futuro
  zone: string; // no Koral vem de GROUPNAME
  actualBalance: string; // soma de todos os balances das activities
  activities: Activity[];
}
