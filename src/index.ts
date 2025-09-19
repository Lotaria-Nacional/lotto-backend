import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import router from './routes';
import env from './constants/env';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins =
  process.env.NODE_ENV === 'production' ? ['https://mtjogos.co.ao'] : ['*', 'http://localhost:5173'];
// const allowedOrigins = ['https://mtjogos.co.ao'];

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

app.use(errorHandler);

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`App running on port:${env.PORT}`);
});

export default app;
