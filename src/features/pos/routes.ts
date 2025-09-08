import {
  getPosController,
  createPosController,
  updatePosController,
  deletePosController,
  fetchPosController,
  deleteManyPosController,
  fetchBoundedPosController,
  fetchPendingPosController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

const posRouter = Router();

posRouter.post('/', catchErrors(createPosController));
posRouter.put('/:id', catchErrors(updatePosController));

posRouter.delete('/bulk', catchErrors(deleteManyPosController));
posRouter.delete('/:id', catchErrors(deletePosController));

posRouter.get('/pending', catchErrors(fetchPendingPosController));
posRouter.get('/', catchErrors(fetchPosController));
posRouter.get('/:id', catchErrors(getPosController));

posRouter.get('/bounds', catchErrors(fetchBoundedPosController));

export default posRouter;
