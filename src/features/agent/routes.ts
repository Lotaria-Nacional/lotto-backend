import {
  getAgentController,
  deleteAgentController,
  createAgentController,
  updateAgentController,
  fetchAgentsController,
  resetAgentController,
  fetchAgentsHistoryController,
  getAgentsInfoController,
} from './controllers';
import multer from 'multer';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { exportAgentController } from './controllers/export-agents-controller';
import { approveAgentController } from './controllers/approve-agent.controller';
import { importAgentsController } from './controllers/import-agents.controller';
import { desativateAgentController } from './controllers/desativate-agent.controller';
import { disapproveAgentController } from './controllers/disapprove-agent.controller';
import { discontinueAgentController } from './controllers/discontinue-agent.controller';
import { reScheduleTrainingController } from './controllers/re-schedule-training-agent.controller';
import { associatePosAndTerminalOnAgentController } from './controllers/associate-pos-and-terminal-on-agent.controller';
import { reactivateAgentController } from './controllers/reactivate-agent.controller';

const agentRouter = Router();

export const upload = multer({ dest: 'uploads/' });

agentRouter.post('/', catchErrors(createAgentController));
agentRouter.post('/import', upload.single('file'), catchErrors(importAgentsController));

agentRouter.put('/re-schedule-training/:id', catchErrors(reScheduleTrainingController));
agentRouter.put('/associate/:id', catchErrors(associatePosAndTerminalOnAgentController));
agentRouter.put('/approve/:id', catchErrors(approveAgentController));
agentRouter.put('/reactivate/:id', catchErrors(reactivateAgentController));
agentRouter.put('/desativate/:id', catchErrors(desativateAgentController));
agentRouter.put('/discontinue/:id', catchErrors(discontinueAgentController));
agentRouter.put('/disapprove/:id', catchErrors(disapproveAgentController));
agentRouter.put('/reset/:id', catchErrors(resetAgentController));
agentRouter.put('/:id', catchErrors(updateAgentController));

agentRouter.delete('/:id', catchErrors(deleteAgentController));

agentRouter.get('/info', catchErrors(getAgentsInfoController));
agentRouter.get('/export', catchErrors(exportAgentController));
agentRouter.get('/history', catchErrors(fetchAgentsHistoryController));
agentRouter.get('/', catchErrors(fetchAgentsController));
agentRouter.get('/:id', catchErrors(getAgentController));

export default agentRouter;
