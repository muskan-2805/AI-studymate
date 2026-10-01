import express from 'express';
import {
    register, login, getMe, refresh, logout, logoutAll,
    forgotPassword, resetPassword, updateProfile, changePassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter, otpSendLimiter, otpVerifyLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe); // protect pehle chalta hai, next() call kare tabhi getMe chalta hai
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);
router.post('/forgot-password', otpSendLimiter, forgotPassword);
router.post('/reset-password', otpVerifyLimiter, resetPassword);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, authLimiter, changePassword);

export default router;
