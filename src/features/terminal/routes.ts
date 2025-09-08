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
import { uploadTerminalsController } from './controllers/upload-terminals.controller';
import multer from 'multer';

const terminalRouter = Router();

export const upload = multer({ dest: 'uploads/' });

terminalRouter.post('/', catchErrors(createTerminalController));
terminalRouter.post('/upload', upload.single('file'), catchErrors(uploadTerminalsController));

terminalRouter.put('/reset/:id', catchErrors(resetTerminalController));
terminalRouter.put('/:id', catchErrors(updateTerminalController));

terminalRouter.delete('/bulk', catchErrors(deleteManyTerminalsController));
terminalRouter.delete('/:id', catchErrors(deleteTerminalController));

terminalRouter.get('/stock', catchErrors(fetchStockTerminalsController));
terminalRouter.get('/broken', catchErrors(fetchBrokenTerminalsController));
terminalRouter.get('/', catchErrors(fetchReadyTerminalsController));
terminalRouter.get('/:id', catchErrors(getTerminalController));

export default terminalRouter;
