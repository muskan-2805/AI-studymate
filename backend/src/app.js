import express from "express";
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth.routes.js';
import otpRoutes from '../routes/otp.routes.js';
import documentRoutes from '../routes/document.routes.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRoutes);
app.use('/api/otp',otpRoutes);
app.use('/api/documents',documentRoutes);

export default app;