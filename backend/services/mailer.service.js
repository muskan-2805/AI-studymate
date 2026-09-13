import nodemailer from 'nodemailer';
import {google} from 'googleapis';

import{
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER,
} from '../config/env.js';

const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);
oAuth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN
});
const createTransporter = async()=>{
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            type:'OAuth2',
            user:GOOGLE_USER,
            clientId:GOOGLE_CLIENT_ID,
            clientSecret:GOOGLE_CLIENT_SECRET,
            refreshToken:GOOGLE_REFRESH_TOKEN,
            accessToken:accessToken.token,
        },
    });
    await transporter.verify();
    return transporter;
};
export const sendMail = async({to,subject,html})=>{
    try{ 
    const transporter = await createTransporter();

    await transporter.sendMail({
        from:`AI Study Buddy <${GOOGLE_USER}>`,
        to,
        subject,
        html,
    });
}catch(err){
    console.error('Email sending failed:',err.message);
    throw new Error('Failed to send email');
}
};