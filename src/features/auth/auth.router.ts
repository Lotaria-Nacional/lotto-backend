import { Router } from 'express';
import { loginController } from './controllers/login.controller';
import { logoutController } from './controllers/logout.controller';
import catchErrors from '../../utils/catch-errors';
import { authenticate } from '../../middleware/auth/authenticate';
import { getProfileController } from './controllers/get-profile.controller';

const authRouter = Router();

authRouter.post('/login', catchErrors(loginController));
authRouter.get('/logout', catchErrors(logoutController));
authRouter.get('/me', authenticate, catchErrors(getProfileController));

export default authRouter;
