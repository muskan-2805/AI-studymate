import { createOtp, verifyOtp as verifyOtpService } from '../services/otp.service.js';
import { sendMail } from '../services/mailer.service.js';
import User from '../models/User.js';
import { createUserSession } from '../services/session.service.js';
import { normalizeEmail } from '../utils/validate.util.js';

export const sendOtp = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (user && !user.isVerified) {
            const otpCode = await createOtp(email);
            await sendMail({
                to: email,
                subject: 'Your AI Study Buddy verification code',
                html: `<p>Your OTP code is: <b>${otpCode}</b></p><p>This code will expire in 5 minutes.</p>`,
            });
        }

        res.status(200).json({ message: 'If this email needs verification, a new code has been sent' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const verifyOtpController = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const result = await verifyOtpService(email, otp);
        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accessToken = await createUserSession(user, req, res);

        res.status(200).json({
            message: 'Email verified successfully',
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
