import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth.routes.js';
import otpRoutes from '../routes/otp.routes.js';
import documentRoutes from '../routes/document.routes.js';
import revisionRoutes from '../routes/revision.routes.js';
import { CLIENT_URL, IS_PROD } from '../config/env.js';
import { apiLimiter } from '../middleware/rateLimit.middleware.js';
import { notFound, errorHandler } from '../middleware/error.middleware.js';

const app = express();

if (IS_PROD) app.set('trust proxy', 1);

app.use(helmet());
app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

app.use(morgan(IS_PROD ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/revision', revisionRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
