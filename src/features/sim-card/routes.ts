import {
  getSimCardController,
  resetSimCardController,
  updateSimCardController,
  createSimCardController,
  deleteSimCardController,
  fetchManySimCardsController,
  deleteManySimCardsController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

const simCardRouter = Router();

simCardRouter.post('/', catchErrors(createSimCardController));

simCardRouter.put('/reset/:id', catchErrors(resetSimCardController));
simCardRouter.put('/:id', catchErrors(updateSimCardController));

simCardRouter.delete('/bulk', catchErrors(deleteManySimCardsController));
simCardRouter.delete('/:id', catchErrors(deleteSimCardController));

simCardRouter.get('/', catchErrors(fetchManySimCardsController));
simCardRouter.get('/:id', catchErrors(getSimCardController));

export default simCardRouter;
