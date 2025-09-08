import {
  getAgentController,
  deleteAgentController,
  createAgentController,
  updateAgentController,
  fetchAgentsController,
  resetAgentController,
  fetchAgentsInTrainingController,
} from './controllers';
import multer from 'multer';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { denyAgentController } from './controllers/deny-agent.controller';
import { approveAgentController } from './controllers/approve-agent.controller';
import { uploadAgentsController } from './controllers/upload-agents.controller';

const agentRouter = Router();

export const upload = multer({ dest: 'uploads/' });

agentRouter.post('/', catchErrors(createAgentController));
agentRouter.post('/upload', upload.single('file'), catchErrors(uploadAgentsController));

agentRouter.put('/approve/:id', catchErrors(approveAgentController));
agentRouter.put('/deny/:id', catchErrors(denyAgentController));
agentRouter.put('/reset/:id', catchErrors(resetAgentController));
agentRouter.put('/:id', catchErrors(updateAgentController));

agentRouter.delete('/:id', catchErrors(deleteAgentController));

agentRouter.get('/training', catchErrors(fetchAgentsInTrainingController));
agentRouter.get('/', catchErrors(fetchAgentsController));
agentRouter.get('/:id', catchErrors(getAgentController));

export default agentRouter;
