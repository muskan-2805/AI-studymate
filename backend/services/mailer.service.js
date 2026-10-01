import nodemailer from 'nodemailer';
import { GMAIL_USER, GMAIL_APP_PASSWORD } from '../config/env.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});

export const sendMail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `AI Study Buddy <${GMAIL_USER}>`,
            to,
            subject,
            html,
        });
    } catch (err) {
        console.error('Email sending failed:', err.message);
        throw new Error('Failed to send email');
    }
};