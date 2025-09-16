import { Router } from 'express';
import catchErrors from '../../utils/catch-errors';
import { fetchAuditLogsController } from './controllers/fetch-many.controller';

const auditLogRouter = Router();

auditLogRouter.get('/', catchErrors(fetchAuditLogsController));

export default auditLogRouter;
