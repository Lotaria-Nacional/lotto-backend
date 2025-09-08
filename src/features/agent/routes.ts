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
import { uploadAgentsController } from './controllers/upload-agents.controller';
import multer from 'multer';

const agentRouter = Router();

export const upload = multer({ dest: 'uploads/' });

agentRouter.post('/', catchErrors(createAgentController));
agentRouter.post('/upload', upload.single('file'), catchErrors(uploadAgentsController));

agentRouter.put('/reset/:id', catchErrors(resetAgentController));
agentRouter.put('/:id', catchErrors(updateAgentController));

agentRouter.delete('/:id', catchErrors(deleteAgentController));

agentRouter.get('/training', catchErrors(fetchAgentsInTrainingController));
agentRouter.get('/', catchErrors(fetchAgentsController));
agentRouter.get('/:id', catchErrors(getAgentController));

export default agentRouter;
