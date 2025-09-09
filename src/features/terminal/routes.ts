import {
  getTerminalController,
  resetTerminalController,
  createTerminalController,
  updateTerminalController,
  deleteTerminalController,
  deleteManyTerminalsController,
  fetchTerminalsController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { uploadTerminalsController } from './controllers/upload-terminals.controller';
import multer from 'multer';
import { activateTerminalController } from './controllers/activate-terminal.controller';
import { associateAgentAndSimCardOnTerminalController } from './controllers/associate-agent-and-sim-card-on-terminal.controller';
import { markTerminalAsFixedController } from './controllers/mark-terminal-as-fixed.controller';

const terminalRouter = Router();

export const upload = multer({ dest: 'uploads/' });

terminalRouter.post('/', catchErrors(createTerminalController));
terminalRouter.post('/upload', upload.single('file'), catchErrors(uploadTerminalsController));

terminalRouter.put('/fix/:id', catchErrors(markTerminalAsFixedController));
terminalRouter.put('/reset/:id', catchErrors(resetTerminalController));
terminalRouter.put('/associate/:id', catchErrors(associateAgentAndSimCardOnTerminalController));
terminalRouter.put('/activate/:id', catchErrors(activateTerminalController));
terminalRouter.put('/:id', catchErrors(updateTerminalController));

terminalRouter.delete('/bulk', catchErrors(deleteManyTerminalsController));
terminalRouter.delete('/:id', catchErrors(deleteTerminalController));

terminalRouter.get('/', catchErrors(fetchTerminalsController));
terminalRouter.get('/:id', catchErrors(getTerminalController));

export default terminalRouter;
