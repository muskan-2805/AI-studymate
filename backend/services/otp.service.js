import crypto from 'crypto';
import Otp from '../models/Otp.js';

const MAX_ATTEMPTS = 5;

const generateOtpCode = () => crypto.randomInt(100000, 1000000).toString();

export const createOtp = async (email) => {
    await Otp.deleteMany({ email });

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await Otp.create({ email, otp: otpCode, expiresAt });
    return otpCode;
};

export const verifyOtp = async (email, otpCode) => {
    const record = await Otp.findOne({ email });

    if (!record) {
        return { valid: false, message: 'Invalid or expired OTP' };
    }

    if (record.expiresAt < new Date()) {
        await record.deleteOne();
        return { valid: false, message: 'OTP has expired' };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
        await record.deleteOne();
        return { valid: false, message: 'Too many wrong attempts. Please request a new OTP.' };
    }

    if (record.otp !== String(otpCode).trim()) {
        record.attempts += 1;
        await record.save();
        return { valid: false, message: 'Invalid OTP' };
    }

    await record.deleteOne();
    return { valid: true, message: 'OTP verified' };
};
