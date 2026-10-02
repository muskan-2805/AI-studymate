import nodemailer from 'nodemailer';
import {
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    BREVO_API_KEY,
    MAIL_FROM_EMAIL,
    MAIL_FROM_NAME,
} from '../config/env.js';

const gmailTransporter =
    !BREVO_API_KEY && GMAIL_USER
        ? nodemailer.createTransport({
              service: 'gmail',
              auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
          })
        : null;

const sendWithBrevo = async ({ to, subject, html }) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            sender: { name: MAIL_FROM_NAME, email: MAIL_FROM_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
        signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Brevo API ${response.status}: ${details}`);
    }
};

const sendWithGmail = async ({ to, subject, html }) => {
    await gmailTransporter.sendMail({
        from: `${MAIL_FROM_NAME} <${GMAIL_USER}>`,
        to,
        subject,
        html,
    });
};

export const sendMail = async ({ to, subject, html }) => {
    try {
        if (BREVO_API_KEY) {
            await sendWithBrevo({ to, subject, html });
        } else {
            await sendWithGmail({ to, subject, html });
        }
    } catch (err) {
        console.error('Email sending failed:', err.message);
        throw new Error('Failed to send email');
    }
};