import { Router } from 'express';
import posRouter from '../features/pos/routes';
import agentRouter from '../features/agent/routes';
import userRouter from '../features/user/routes';
import authRouter from '../features/auth/auth.router';
import simCardRouter from '../features/sim-card/routes';
import licenceRouter from '../features/licence/routes';
import groupRouter from '../features/group/routes';
import auditLogRouter from '../features/audit-log/routes';
import { authenticate } from '../middleware/auth/authenticate';
import terminalRouter from '../features/terminal/routes';
import { refreshTokenController } from '../features/auth/controllers/refresh-token.controller';
import { adminRoutes, areasRoutes, provincesRoutes, typesRoutes } from '../features/references/routes';

const router = Router();

// Auth routers
router.use('/auth', authRouter);

//refresh token
router.post('/refresh-token', refreshTokenController);

// Main routers
router.use('/groups', groupRouter);
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

export default router;
