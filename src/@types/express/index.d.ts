import { AuthPayload } from '../auth-payload';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
