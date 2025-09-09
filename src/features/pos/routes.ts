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
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { uploadPosService } from './services/upload-pos-sevice';
import { upload } from '../agent/routes';
import { approvePosController } from './controllers/approve-pos.controller';

const posRouter = Router();

posRouter.post('/', catchErrors(createPosController));
posRouter.post('/upload', upload.single('file'), catchErrors(uploadPosService));

posRouter.put('/approve/:id', catchErrors(approvePosController));
posRouter.put('/associate/:id', catchErrors(associateAgentAndLicenceToPosController));
posRouter.put('/reset/:id', catchErrors(resetPosController));
posRouter.put('/:id', catchErrors(updatePosController));

posRouter.delete('/bulk', catchErrors(deleteManyPosController));
posRouter.delete('/:id', catchErrors(deletePosController));

posRouter.get('/pending', catchErrors(fetchPendingPosController));
posRouter.get('/', catchErrors(fetchPosController));
posRouter.get('/:id', catchErrors(getPosController));

posRouter.get('/bounds', catchErrors(fetchBoundedPosController));

export default posRouter;
