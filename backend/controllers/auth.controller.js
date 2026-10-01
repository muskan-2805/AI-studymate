import User from '../models/User.js';
import Session from '../models/Session.js';
import jwt from 'jsonwebtoken';
import { createOtp, verifyOtp as verifyOtpService } from '../services/otp.service.js';
import { sendMail } from '../services/mailer.service.js';
import { JWT_REFRESH_SECRET } from '../config/env.js';
import { generateAccessToken, generateRefreshToken } from '../services/token.service.js';
import { createUserSession, REFRESH_COOKIE_OPTIONS } from '../services/session.service.js';
import { normalizeEmail, isValidEmail } from '../utils/validate.util.js';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const sendVerificationMail = (email, otpCode) =>
    sendMail({
        to: email,
        subject: 'Verify your email for AI Study Buddy',
        html: `<p>Your verification code is: <b>${otpCode}</b></p><p>This code will expire in 5 minutes.</p>`,
    });

export const register = async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = normalizeEmail(req.body.email);
        const password = req.body.password;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        const otpCode = await createOtp(email);
        await sendVerificationMail(email, otpCode);

        res.status(201).json({
            message: 'User registered successfully, please verify with the OTP sent to your email',
            email: user.email,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            const otpCode = await createOtp(email);
            await sendVerificationMail(email, otpCode);
            return res.status(403).json({
                message: 'Email not verified. A new verification code has been sent to your email.',
                needsVerification: true,
                email: user.email,
            });
        }

        const accessToken = await createUserSession(user, req, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({ message: 'No refresh token,please log in' });
        }
        const session = await Session.findOne({ refreshToken: token, revoked: false });
        if (!session) {
            return res.status(401).json({ message: 'Session not found,please log in' });
        }
        if (session.expiresAt < new Date()) {
            session.revoked = true;
            await session.save();
            return res.status(401).json({ message: 'Session expired,please log in' });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (err) {
            session.revoked = true;
            await session.save();
            return res.status(401).json({ message: 'Invalid refresh token,please log in' });
        }

        const newAccessToken = generateAccessToken(decoded.id);
        const newRefreshToken = generateRefreshToken(decoded.id);

        session.revoked = true;
        await session.save();

        await Session.create({
            user: decoded.id,
            refreshToken: newRefreshToken,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            expiresAt: new Date(Date.now() + SEVEN_DAYS),
        });

        res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getMe = async (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    });
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (token) {
            await Session.updateOne({ refreshToken: token }, { revoked: true });
        }
    
        const { maxAge, ...clearOptions } = REFRESH_COOKIE_OPTIONS;
        res.clearCookie('refreshToken', clearOptions);

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const logoutAll = async (req, res) => {
    try {
        await Session.updateMany({ user: req.user._id, revoked: false }, { revoked: true });
        const { maxAge, ...clearOptions } = REFRESH_COOKIE_OPTIONS;
        res.clearCookie('refreshToken', clearOptions);

        res.status(200).json({ message: 'Logged out from all devices successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (user) {
            const otpCode = await createOtp(email);
            await sendMail({
                to: email,
                subject: 'Reset your AI Study Buddy password',
                html: `<p>Your password reset code is: <b>${otpCode}</b></p><p>This code will expire in 5 minutes.</p>`,
            });
        }

        res.status(200).json({ message: 'If an account exists with this email, a reset code has been sent' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }
        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const result = await verifyOtpService(email, otp);
        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.password = newPassword;
        await user.save();

        await Session.updateMany({ user: user._id, revoked: false }, { revoked: true });

        res.status(200).json({ message: 'Password reset successfully. Please log in with your new password.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true }).select('-password');

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }
        if (typeof newPassword !== 'string' || newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        await Session.updateMany({ user: user._id, revoked: false }, { revoked: true });

        res.status(200).json({ message: 'Password changed successfully. Please log in again.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
