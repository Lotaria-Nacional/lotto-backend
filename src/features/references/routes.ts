import {
  fetchAdminsController,
  fetchAreasController,
  fetchProvincesController,
  fetchTypesController,
} from './controllers';
import { Router } from 'express';

const adminRoutes = Router();
const provincesRoutes = Router();
const typesRoutes = Router();
const areasRoutes = Router();

typesRoutes.get('/', fetchTypesController);
areasRoutes.get('/', fetchAreasController);
adminRoutes.get('/', fetchAdminsController);
provincesRoutes.get('/', fetchProvincesController);

export { typesRoutes, adminRoutes, areasRoutes, provincesRoutes };
