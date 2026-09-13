import{createOtp,verifyOtp as verifyOtpService} from '../services/otp.service.js';
import {sendMail} from '../services/mailer.service.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import {generateAccessToken,generateRefreshToken} from '../services/token.service.js';
import {createUserSession,REFRESH_COOKIE_OPTIONS} from '../services/session.service.js';

export const sendOtp = async(req,res)=>{
    try{
        const {email} = req.body;

        if(!email){
            return res.status(400).json({
                message:'Email is required'
            });
        }
        const otpCode = await createOtp(email);

        await sendMail({
            to:email,
            subject:'Your AI Study Buddy verification code',
            html:`<p>Your OTP code is: <b>${otpCode}</b></p><p>This code will expire in 5 minutes.</p>`,
        });

        res.status(200).json({
            message:'OTP sent successfully'
        });
    }catch(err){
        res.status(500).json({
            message:'Server error',error:err.message
        });
    }
};
export const verifyOtpController = async(req,res)=>{
    try{
        const {email,otp} = req.body;

        if(!email || !otp){
            return res.status(400).json({
                message:'Email and OTP are required'
            });
        }
        const result = await verifyOtpService(email,otp);
        if(!result.valid){
            return res.status(400).json({
                message:result.message
            });
        }
        const user = await User.findOneAndUpdate({email},{isVerified:true},
            {new:true}
        );
        const accessToken = await createUserSession(user,req,res);

        res.status(200).json({
            message:'Email verified successfully',
            _id:user._id,
            name:user.name,
            email:user.email,
            accessToken,
        });
    }catch(err){
        res.status(500).json({
            message:'Server error',error:err.message
        });
    }
};        