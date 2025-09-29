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
import { activateAgentController } from './controllers/activate-agent.controller';
import { reactivateAgentController } from './controllers/reactivate-agent.controller';
import { approveManyAgentsController } from './controllers/approve-many-agents.controller';
import { desativateManyAgentsController } from './controllers/desativate-many-agents.controller';
import { disapproveManyAgentsController } from './controllers/disapprove-many-agents.controller';
import { resetManyAgentsController } from './controllers/reset-many-agents.controller';
import { discontinueManyAgentsController } from './controllers/discontinue-many-agents.controller';
import { reactivateManyAgentsController } from './controllers/reactivate-many-agents.controller';

const agentRouter = Router();

export const upload = multer({ dest: 'uploads/' });

agentRouter.post('/', catchErrors(createAgentController));
agentRouter.post('/import', upload.single('file'), catchErrors(importAgentsController));

agentRouter.put('/reset-many', catchErrors(resetManyAgentsController));
agentRouter.put('/approve-many', catchErrors(approveManyAgentsController));
agentRouter.put('/desativate-many', catchErrors(desativateManyAgentsController));
agentRouter.put('/disapprove-many', catchErrors(disapproveManyAgentsController));
agentRouter.put('/discontinue-many', catchErrors(discontinueManyAgentsController));
agentRouter.put('/reactivate-many', catchErrors(reactivateManyAgentsController));

agentRouter.put('/reset/:id', catchErrors(resetAgentController));
agentRouter.put('/approve/:id', catchErrors(approveAgentController));
agentRouter.put('/reactivate/:id', catchErrors(reactivateAgentController));
agentRouter.put('/desativate/:id', catchErrors(desativateAgentController));
agentRouter.put('/disapprove/:id', catchErrors(disapproveAgentController));
agentRouter.put('/discontinue/:id', catchErrors(discontinueAgentController));
agentRouter.put('/re-schedule-training/:id', catchErrors(reScheduleTrainingController));
agentRouter.put('/associate/:id', catchErrors(activateAgentController));

agentRouter.put('/:id', catchErrors(updateAgentController));

agentRouter.delete('/:id', catchErrors(deleteAgentController));

agentRouter.get('/info', catchErrors(getAgentsInfoController));
agentRouter.get('/export', catchErrors(exportAgentController));
agentRouter.get('/history', catchErrors(fetchAgentsHistoryController));
agentRouter.get('/', catchErrors(fetchAgentsController));
agentRouter.get('/:id', catchErrors(getAgentController));

export default agentRouter;
