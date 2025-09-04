import {
  getPosController,
  createPosController,
  updatePosController,
  deletePosController,
  fetchManyPosController,
  deleteManyPosController,
  fetchBoundedPosController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

const posRouter = Router();

posRouter.post('/', catchErrors(createPosController));
posRouter.put('/:id', catchErrors(updatePosController));

posRouter.delete('/bulk', catchErrors(deleteManyPosController));
posRouter.delete('/:id', catchErrors(deletePosController));

posRouter.get('/', catchErrors(fetchManyPosController));
posRouter.get('/:id', catchErrors(getPosController));

posRouter.get('/bounds', catchErrors(fetchBoundedPosController));

export default posRouter;
