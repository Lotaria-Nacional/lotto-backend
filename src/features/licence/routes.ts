import {
  getLicenceController,
  createLicenceController,
  deleteLicenceController,
  updateLicenceController,
  fetchManyLicencesController,
  deleteManyLicencesController,
} from './controllers';
import { Router } from 'express';
import { upload } from '../agent/routes';
import catchErrors from '../../utils/catch-errors';
import { importLicencesController } from './controllers/import-licence.controller';
import { exportLicencesController } from './controllers/export-licences.controller';

const licenceRouter = Router();

licenceRouter.post('/', catchErrors(createLicenceController));
licenceRouter.post('/import', upload.single('file'), catchErrors(importLicencesController));

licenceRouter.put('/:id', catchErrors(updateLicenceController));

licenceRouter.delete('/bulk', catchErrors(deleteManyLicencesController));
licenceRouter.delete('/:id', catchErrors(deleteLicenceController));

licenceRouter.get('/export', catchErrors(exportLicencesController));
licenceRouter.get('/:id', catchErrors(getLicenceController));
licenceRouter.get('/', catchErrors(fetchManyLicencesController));

export default licenceRouter;
