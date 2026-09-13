import express from 'express';
import { sendOtp, verifyOtpController } from '../controllers/otp.controller.js';

const router = express.Router();

router.post('/send', sendOtp);
router.post('/verify', verifyOtpController);

export default router;