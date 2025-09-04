import {
  getAgentController,
  deleteAgentController,
  createAgentController,
  updateAgentController,
  fetchManyAgentsController,
  resetAgentController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

const agentRouter = Router();

agentRouter.post('/', catchErrors(createAgentController));

agentRouter.put('/reset/:id', catchErrors(resetAgentController));
agentRouter.put('/:id', catchErrors(updateAgentController));

agentRouter.delete('/:id', catchErrors(deleteAgentController));

agentRouter.get('/:id', catchErrors(getAgentController));
agentRouter.get('/', catchErrors(fetchManyAgentsController));

export default agentRouter;
