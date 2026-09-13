import User from '../models/User.js';
import Session from '../models/Session.js';
import jwt from 'jsonwebtoken';
import {createOtp} from '../services/otp.service.js';
import { sendMail } from '../services/mailer.service.js';
import { JWT_REFRESH_SECRET } from '../config/env.js';
import { generateAccessToken, generateRefreshToken } from '../services/token.service.js';
import { createUserSession,REFRESH_COOKIE_OPTIONS} from '../services/session.service.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User alredy exists'
            });
        }
        const user = await User.create({
            name, email, password
        });

        const otpCode = await createOtp(email);

        await sendMail({
            to: email,
            subject: 'Verify your email for AI Study Buddy',
            html: `<p>Your verification code is: <b>${otpCode}</b></p><p>This code will expire in 5 minutes.</p>`,
        });

        res.status(201).json({
            message: 'User registered successfully, please verify with the OTP sent to your email',
            email: user.email,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error', error: err.message
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }
        const accessToken = await createUserSession(user, req, res);

        res.status(200). json({
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error', error: err.message
        });
    }
};
export const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                message: 'No refresh token,please log in'
            });
        }
        const session = await Session.findOne({
            refreshToken: token,
            revoked: false
        });
        if (!session) {
            return res.status(401).json({
                message: 'Session not found,please log in'
            });
        }
        if (session.expiresAt < new Date()) {
            session.revoked = true;
            await session.save();
            return res.status(401).json({
                message: 'Session expired,please log in'
            });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (err) {
            session.revoked = true;
            await session.save();
            return res.status(401).json({
                message: 'Invalid refresh token,please log in'
            });
        }

        const newAccessToken = generateAccessToken(decoded.id);
        const newRefreshToken = generateRefreshToken(decoded.id);

        session.revoked = true;
        await session.save();

        await Session.create({
            user:decoded.id,
            refreshToken:newRefreshToken,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),//7days
        });

        res.cookie('refreshToken',newRefreshToken,REFRESH_COOKIE_OPTIONS);

        res.status(200).json({
            accessToken: newAccessToken
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error', error: err.message
        });
    }
};
export const getMe = async (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    });
};
export const logout = async(req,res)=>{
    try{
        const token = req.cookies.refreshToken;

        if(token){
            await Session.updateOne({
                refreshToken:token
            },{revoked:true});
        }
        res.clearCookie('refreshToken',REFRESH_COOKIE_OPTIONS);

        res.status(200).json({
            message:'Logged out successfully'
        });
    }catch(err){
        res.status(500).json({
            message:'Server error',error:err.message
        });
    }
};
export const logoutAll = async(req,res)=>{
    try{
        await Session.updateMany({
            user:req.user._id,
            revoked:false
        },{revoked:true});
        res.clearCookie('refreshToken',REFRESH_COOKIE_OPTIONS);

        res.status(200).json({
            message:'Logged out from all devices successfully'
        });
    }catch(err){
        res.status(500).json({
            message:'Server error',error:err.message
        });
    }
};