import {
  getPosController,
  createPosController,
  updatePosController,
  deletePosController,
  fetchPosController,
  deleteManyPosController,
  fetchBoundedPosController,
  fetchPendingPosController,
  associateAgentAndLicenceToPosController,
  resetPosController,
  fetchPosHistoryController,
} from './controllers';
import { Router } from 'express';
import { upload } from '../agent/routes';
import catchErrors from '../../utils/catch-errors';
import { denyPosController } from './controllers/deny-pos.controller';
import { approvePosController } from './controllers/approve-pos.controller';
import { exportPosController } from './controllers/export-pos-controller';
import { importPosController } from './controllers/import-pos.controller';

const posRouter = Router();

posRouter.post('/upload', upload.single('file'), catchErrors(importPosController));
posRouter.post('/', catchErrors(createPosController));

posRouter.put('/deny/:id', catchErrors(denyPosController));
posRouter.put('/approve/:id', catchErrors(approvePosController));
posRouter.put('/associate/:id', catchErrors(associateAgentAndLicenceToPosController));
posRouter.put('/reset/:id', catchErrors(resetPosController));
posRouter.put('/:id', catchErrors(updatePosController));

posRouter.delete('/bulk', catchErrors(deleteManyPosController));
posRouter.delete('/:id', catchErrors(deletePosController));

posRouter.get('/export', catchErrors(exportPosController));
posRouter.get('/history', catchErrors(fetchPosHistoryController));
posRouter.get('/pending', catchErrors(fetchPendingPosController));
posRouter.get('/bounded', catchErrors(fetchBoundedPosController));

posRouter.get('/', catchErrors(fetchPosController));
posRouter.get('/:id', catchErrors(getPosController));

export default posRouter;
