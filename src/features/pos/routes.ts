import {
  getPosController,
  createPosController,
  updatePosController,
  deletePosController,
  fetchPosController,
  deleteManyPosController,
  fetchBoundedPosController,
  fetchPendingPosController,
  activatePosController,
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
import { getPosInfoController } from './controllers/get-pos-info.controller';
import { approveManyPosController } from './controllers/approve-many-pos.controller';
import { denyManyPosController } from './controllers/deny-many-pos.controller';
import { resetManyPosController } from './controllers/reset-many-pos.controller';
import { reactivatePosController } from './controllers/re-activate-pos.controller';
import { reactivateManyPosController } from './controllers/re-activate-many-pos-controller';

const posRouter = Router();

posRouter.post('/import', upload.single('file'), catchErrors(importPosController));
posRouter.post('/', catchErrors(createPosController));

posRouter.put('/deny-many', catchErrors(denyManyPosController));
posRouter.put('/reset-many', catchErrors(resetManyPosController));
posRouter.put('/approve-many', catchErrors(approveManyPosController));
posRouter.put('/re-activate-many', catchErrors(reactivateManyPosController));

posRouter.put('/re-activate/:id', catchErrors(reactivatePosController));
posRouter.put('/deny/:id', catchErrors(denyPosController));
posRouter.put('/approve/:id', catchErrors(approvePosController));
posRouter.put('/associate/:id', catchErrors(activatePosController));
posRouter.put('/reset/:id', catchErrors(resetPosController));
posRouter.put('/:id', catchErrors(updatePosController));

posRouter.delete('/bulk', catchErrors(deleteManyPosController));
posRouter.delete('/:id', catchErrors(deletePosController));

posRouter.get('/info', catchErrors(getPosInfoController));
posRouter.get('/export', catchErrors(exportPosController));
posRouter.get('/history', catchErrors(fetchPosHistoryController));
posRouter.get('/pending', catchErrors(fetchPendingPosController));
posRouter.get('/bounded', catchErrors(fetchBoundedPosController));

posRouter.get('/', catchErrors(fetchPosController));
posRouter.get('/:id', catchErrors(getPosController));

export default posRouter;
