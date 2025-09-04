import {
  getTerminalController,
  resetTerminalController,
  createTerminalController,
  updateTerminalController,
  deleteTerminalController,
  fetchManyTerminalsController,
  deleteManyTerminalsController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

const terminalRouter = Router();

terminalRouter.post('/', catchErrors(createTerminalController));

terminalRouter.put('/reset/:id', catchErrors(resetTerminalController));
terminalRouter.put('/:id', catchErrors(updateTerminalController));

terminalRouter.delete('/bulk', catchErrors(deleteManyTerminalsController));
terminalRouter.delete('/:id', catchErrors(deleteTerminalController));

terminalRouter.get('/', catchErrors(fetchManyTerminalsController));
terminalRouter.get('/:id', catchErrors(getTerminalController));

export default terminalRouter;
