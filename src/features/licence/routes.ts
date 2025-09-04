import {
  getLicenceController,
  createLicenceController,
  deleteLicenceController,
  updateLicenceController,
  fetchManyLicencesController,
  deleteManyLicencesController,
} from './controllers';
import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';

const licenceRouter = Router();

licenceRouter.post('/', catchErrors(createLicenceController));
licenceRouter.put('/:id', catchErrors(updateLicenceController));

licenceRouter.delete('/bulk', catchErrors(deleteManyLicencesController));
licenceRouter.delete('/:id', catchErrors(deleteLicenceController));

licenceRouter.get('/:id', catchErrors(getLicenceController));
licenceRouter.get('/', catchErrors(fetchManyLicencesController));

export default licenceRouter;
