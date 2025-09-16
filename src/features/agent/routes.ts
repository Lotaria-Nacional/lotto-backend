import {
  getAgentController,
  deleteAgentController,
  createAgentController,
  updateAgentController,
  fetchAgentsController,
  resetAgentController,
  fetchAgentsHistoryController,
} from './controllers';
import multer from 'multer';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { denyAgentController } from './controllers/deny-agent.controller';
import { exportAgentController } from './controllers/export-agents-controller';
import { approveAgentController } from './controllers/approve-agent.controller';
import { importAgentsController } from './controllers/import-agents.controller';
import { desativateAgentController } from './controllers/desativate-agent.controller';
import { associatePosAndTerminalOnAgentController } from './controllers/associate-pos-and-terminal-on-agent.controller';

const agentRouter = Router();

//TODO: mudar o uploads/ para algo fora do servidor
export const upload = multer({ dest: 'uploads/' });

agentRouter.post('/', catchErrors(createAgentController));
agentRouter.post('/upload', upload.single('file'), catchErrors(importAgentsController));

agentRouter.put('/associate/:id', catchErrors(associatePosAndTerminalOnAgentController));
agentRouter.put('/approve/:id', catchErrors(approveAgentController));
agentRouter.put('/desativate/:id', catchErrors(desativateAgentController));
agentRouter.put('/deny/:id', catchErrors(denyAgentController));
agentRouter.put('/reset/:id', catchErrors(resetAgentController));
agentRouter.put('/:id', catchErrors(updateAgentController));

agentRouter.delete('/:id', catchErrors(deleteAgentController));

agentRouter.get('/export', catchErrors(exportAgentController));
agentRouter.get('/history', catchErrors(fetchAgentsHistoryController));
agentRouter.get('/', catchErrors(fetchAgentsController));
agentRouter.get('/:id', catchErrors(getAgentController));

export default agentRouter;
