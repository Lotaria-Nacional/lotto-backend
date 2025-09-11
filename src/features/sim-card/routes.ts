import {
  getSimCardController,
  resetSimCardController,
  updateSimCardController,
  createSimCardController,
  deleteSimCardController,
  fetchSimCardsController,
  deleteManySimCardsController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { uploadSimCardsController } from './controllers/upload-sim-cards.controller';
import multer from 'multer';
import { upload } from '../agent/routes';

const simCardRouter = Router();

simCardRouter.post('/', catchErrors(createSimCardController));
simCardRouter.post('/upload', upload.single('file'), catchErrors(uploadSimCardsController));

simCardRouter.put('/reset/:id', catchErrors(resetSimCardController));
simCardRouter.put('/:id', catchErrors(updateSimCardController));

simCardRouter.delete('/bulk', catchErrors(deleteManySimCardsController));
simCardRouter.delete('/:id', catchErrors(deleteSimCardController));

simCardRouter.get('/', catchErrors(fetchSimCardsController));
simCardRouter.get('/:id', catchErrors(getSimCardController));

export default simCardRouter;
