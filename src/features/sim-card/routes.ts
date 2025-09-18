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
import { importSimCardsController } from './controllers/import-sim-cards.controller';
import { upload } from '../agent/routes';

const simCardRouter = Router();

simCardRouter.post('/', catchErrors(createSimCardController));
simCardRouter.post('/import', upload.single('file'), catchErrors(importSimCardsController));

simCardRouter.put('/reset/:id', catchErrors(resetSimCardController));
simCardRouter.put('/:id', catchErrors(updateSimCardController));

simCardRouter.delete('/bulk', catchErrors(deleteManySimCardsController));
simCardRouter.delete('/:id', catchErrors(deleteSimCardController));

simCardRouter.get('/', catchErrors(fetchSimCardsController));
simCardRouter.get('/:id', catchErrors(getSimCardController));

export default simCardRouter;
