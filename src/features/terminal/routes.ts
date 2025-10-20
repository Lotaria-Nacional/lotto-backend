import multer from 'multer';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

import * as controllers from './controllers';

const terminalRouter = Router();

export const upload = multer({ dest: 'uploads/' });

terminalRouter.post('/', catchErrors(controllers.createTerminalController));
terminalRouter.post('/import', upload.single('file'), catchErrors(controllers.importTerminalsController));

terminalRouter.put('/fix-many', catchErrors(controllers.fixManyTerminalsController));
terminalRouter.put('/reset-many', catchErrors(controllers.resetManyTerminalsController));

terminalRouter.put('/report-mal-function/:id', catchErrors(controllers.reporTerminalMalFunctionController));
terminalRouter.put('/fix/:id', catchErrors(controllers.fixTerminalController));
terminalRouter.put('/reset/:id', catchErrors(controllers.resetTerminalController));
terminalRouter.put('/associate/:id', catchErrors(controllers.associateSimCardOnTerminalController));
terminalRouter.put('/activate/:id', catchErrors(controllers.activateTerminalController));
terminalRouter.put('/:id', catchErrors(controllers.updateTerminalController));

terminalRouter.delete('/bulk', catchErrors(controllers.deleteManyTerminalsController));
terminalRouter.delete('/:id', catchErrors(controllers.deleteTerminalController));

terminalRouter.get('/info', catchErrors(controllers.getTerminalsInfoController));
terminalRouter.get('/export', catchErrors(controllers.exportTerminalController));
terminalRouter.get('/history', catchErrors(controllers.fetchTerminalsHistoryController));
terminalRouter.get('/:id', catchErrors(controllers.getTerminalController));
terminalRouter.get('/', catchErrors(controllers.fetchTerminalsController));

export default terminalRouter;
