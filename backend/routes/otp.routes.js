import express from 'express';
import { sendOtp, verifyOtpController } from '../controllers/otp.controller.js';
import { otpSendLimiter, otpVerifyLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/send', otpSendLimiter, sendOtp);
router.post('/verify', otpVerifyLimiter, verifyOtpController);

export default router;
