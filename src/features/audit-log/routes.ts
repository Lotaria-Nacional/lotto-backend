import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { fetchManyAuditLogsController } from './controllers/fetch-many.controller';

const auditLogRouter = Router();

auditLogRouter.get('/', catchErrors(fetchManyAuditLogsController));

export default auditLogRouter;
