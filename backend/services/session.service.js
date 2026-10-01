import Session from '../models/Session.js';
import { generateAccessToken, generateRefreshToken } from './token.service.js';
import { IS_PROD } from '../config/env.js';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: SEVEN_DAYS,
};

export const createUserSession = async (user, req, res) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Session.create({
        user: user._id,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        expiresAt: new Date(Date.now() + SEVEN_DAYS),
    });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    return accessToken;
};
