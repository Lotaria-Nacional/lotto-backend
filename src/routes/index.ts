import { Router } from 'express';
import posRouter from '../features/pos/routes';
import userRouter from '../features/user/routes';
import groupRouter from '../features/group/routes';
import agentRouter from '../features/agent/routes';
import authRouter from '../features/auth/auth.router';
import simCardRouter from '../features/sim-card/routes';
import licenceRouter from '../features/licence/routes';
import terminalRouter from '../features/terminal/routes';
import auditLogRouter from '../features/audit-log/routes';
import cloudflareWorker from './cloudflare';
import { authenticate } from '../middleware/auth/authenticate';
import { getAgentProgress } from '../features/agent/controllers';
import { getTerminalProgress } from '../features/terminal/controllers';
import { refreshTokenController } from '../features/auth/controllers/refresh-token.controller';
import { getLicenceProgress } from '../features/licence/controllers/import-licence.controller';
import { adminRoutes, areasRoutes, provincesRoutes, typesRoutes } from '../features/references/routes';
import catchErrors from '../utils/catch-errors';
import { getPosProgress } from '../features/pos/controllers/import-pos.controller';

const router = Router();

// Auth routers
router.use('/auth', authRouter);

//refresh token
router.post('/refresh-token', refreshTokenController);

// progress
router.get('/agents/import/progress', catchErrors(getAgentProgress));
router.get('/licences/import/progress', catchErrors(getLicenceProgress));
router.get('/terminals/import/progress', catchErrors(getTerminalProgress));
router.get('/pos/import/progress', catchErrors(getPosProgress));
// router.get('/activities/import/progress', getActivitiesProgress);

// Main routers
router.use('/groups', authenticate, groupRouter);
router.use('/pos', authenticate, posRouter);
router.use('/users', authenticate, userRouter);
router.use('/agents', authenticate, agentRouter);
router.use('/licences', authenticate, licenceRouter);
router.use('/sim-cards', authenticate, simCardRouter);
router.use('/terminals', authenticate, terminalRouter);

// Other routers
router.use('/areas', authenticate, areasRoutes);
router.use('/types', authenticate, typesRoutes);
router.use('/admins', authenticate, adminRoutes);
router.use('/provinces', authenticate, provincesRoutes);
router.use('/audit-logs', authenticate, auditLogRouter);

router.use('/cloudflare-worker', cloudflareWorker);

export default router;
