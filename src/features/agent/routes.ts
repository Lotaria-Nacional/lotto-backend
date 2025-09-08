import {
  getAgentController,
  deleteAgentController,
  createAgentController,
  updateAgentController,
  fetchAgentsController,
  resetAgentController,
  fetchAgentsInTrainingController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

const agentRouter = Router();

agentRouter.post('/', catchErrors(createAgentController));

agentRouter.put('/reset/:id', catchErrors(resetAgentController));
agentRouter.put('/:id', catchErrors(updateAgentController));

agentRouter.delete('/:id', catchErrors(deleteAgentController));

agentRouter.get('/training', catchErrors(fetchAgentsInTrainingController));
agentRouter.get('/', catchErrors(fetchAgentsController));
agentRouter.get('/:id', catchErrors(getAgentController));

export default agentRouter;
