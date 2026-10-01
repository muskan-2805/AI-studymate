import rateLimit from 'express-rate-limit';

const make = (windowMinutes, max, message) =>
    rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message },
    });

export const apiLimiter = make(15, 300, 'Too many requests, please try again later');

// Login / register / refresh-sensitive routes
export const authLimiter = make(15, 30, 'Too many attempts, please try again in a few minutes');

export const otpSendLimiter = make(15, 5, 'Too many OTP requests, please try again in a few minutes');

export const otpVerifyLimiter = make(15, 20, 'Too many verification attempts, please try again later');

export const aiLimiter = make(15, 40, 'Too many AI requests, please slow down and try again shortly');
