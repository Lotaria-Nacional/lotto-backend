import {
  getTerminalController,
  resetTerminalController,
  createTerminalController,
  updateTerminalController,
  deleteTerminalController,
  deleteManyTerminalsController,
  fetchTerminalsController,
  fetchTerminalsHistoryController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { importTerminalsController } from './controllers/import-terminals.controller';
import multer from 'multer';
import { activateTerminalController } from './controllers/activate-terminal.controller';
import { associateSimCardOnTerminalController } from './controllers/activate-terminal-controller';
import { fixTerminalController } from './controllers/fix-terminal-controller';
import { exportTerminalController } from './controllers/export-terminals.controller';
import { getTerminalsInfoController } from './controllers/get-terminals-info.controller';
import { reporTerminalMalFunctionController } from './controllers/report-terminal-mal-function.controller';
import { resetManyTerminalsController } from './controllers/reset-many-terminals.controller';
import { fixManyTerminalsController } from './controllers/fix-many-terminals-controller';

const terminalRouter = Router();

export const upload = multer({ dest: 'uploads/' });

terminalRouter.post('/', catchErrors(createTerminalController));
terminalRouter.post('/import', upload.single('file'), catchErrors(importTerminalsController));

terminalRouter.put('/fix-many', catchErrors(fixManyTerminalsController));
terminalRouter.put('/reset-many', catchErrors(resetManyTerminalsController));

terminalRouter.put('/report-mal-function/:id', catchErrors(reporTerminalMalFunctionController));
terminalRouter.put('/fix/:id', catchErrors(fixTerminalController));
terminalRouter.put('/reset/:id', catchErrors(resetTerminalController));
terminalRouter.put('/associate/:id', catchErrors(associateSimCardOnTerminalController));
terminalRouter.put('/activate/:id', catchErrors(activateTerminalController));
terminalRouter.put('/:id', catchErrors(updateTerminalController));

terminalRouter.delete('/bulk', catchErrors(deleteManyTerminalsController));
terminalRouter.delete('/:id', catchErrors(deleteTerminalController));

terminalRouter.get('/info', catchErrors(getTerminalsInfoController));
terminalRouter.get('/export', catchErrors(exportTerminalController));
terminalRouter.get('/history', catchErrors(fetchTerminalsHistoryController));
terminalRouter.get('/:id', catchErrors(getTerminalController));
terminalRouter.get('/', catchErrors(fetchTerminalsController));

export default terminalRouter;
