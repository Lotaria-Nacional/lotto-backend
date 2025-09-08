import {
  getTerminalController,
  resetTerminalController,
  createTerminalController,
  updateTerminalController,
  deleteTerminalController,
  deleteManyTerminalsController,
  fetchReadyTerminalsController,
  fetchBrokenTerminalsController,
  fetchStockTerminalsController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

const terminalRouter = Router();

terminalRouter.post('/', catchErrors(createTerminalController));

terminalRouter.put('/reset/:id', catchErrors(resetTerminalController));
terminalRouter.put('/:id', catchErrors(updateTerminalController));

terminalRouter.delete('/bulk', catchErrors(deleteManyTerminalsController));
terminalRouter.delete('/:id', catchErrors(deleteTerminalController));

terminalRouter.get('/stock', catchErrors(fetchStockTerminalsController));
terminalRouter.get('/broken', catchErrors(fetchBrokenTerminalsController));
terminalRouter.get('/', catchErrors(fetchReadyTerminalsController));
terminalRouter.get('/:id', catchErrors(getTerminalController));

export default terminalRouter;
