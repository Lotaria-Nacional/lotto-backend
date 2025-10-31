import cors from 'cors';
import express from 'express';
import env from './constants/env';
import cookieParser from 'cookie-parser';

import router from './routes';
import { errorHandler } from './middleware/error-handler';
import reconciliationRouter from './features/agent/controllers/reconciliation-controller';

console.log('NODE_ENV:', env.NODE_ENV);
console.log('DATABASE_URL:', env.DATABASE_URL);

const app = express();
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const allowedOrigins = env.isDev ? ['*', 'http://localhost:5173'] : [env.FRONTEND_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use('/api', router);
app.use('/api/reconciliation', reconciliationRouter);
app.use(errorHandler);

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`APP RUNNING ON PORT: ${env.PORT}`);
  console.log(`APP RUNNING FOR: ${env.FRONTEND_URL}`);
});

export default app;
