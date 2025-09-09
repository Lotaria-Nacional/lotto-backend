import type { Response, Request } from 'express';
import { HttpStatus } from '../../../constants/http';
import { updateAgentSchema } from '@lotaria-nacional/lotto';
import { idSchema } from '../../../schemas/common/id.schema';
import { associatePosAndagentOnAgentService } from '../services/associate-pos-and-terminal-on-agent.service';

export async function associatePosAndTerminalOnAgentController(req: Request, res: Response) {
  const { id } = idSchema.parse(req.params);
  const body = updateAgentSchema.parse({ ...req.body, id });

  await associatePosAndagentOnAgentService(body);

  return res.status(HttpStatus.OK).json({ message: 'Agente ativado' });
}
