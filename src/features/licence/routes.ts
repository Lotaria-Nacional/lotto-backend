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
import { importLicencesController } from './controllers/import-licence.controller';
import { upload } from '../agent/routes';

const licenceRouter = Router();

licenceRouter.post('/', catchErrors(createLicenceController));
licenceRouter.post('/import', upload.single('file'), catchErrors(importLicencesController));

licenceRouter.put('/:id', catchErrors(updateLicenceController));

licenceRouter.delete('/bulk', catchErrors(deleteManyLicencesController));
licenceRouter.delete('/:id', catchErrors(deleteLicenceController));

licenceRouter.get('/:id', catchErrors(getLicenceController));
licenceRouter.get('/', catchErrors(fetchManyLicencesController));

export default licenceRouter;
