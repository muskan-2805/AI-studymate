import Otp from '../models/Otp.js';

const generateOtpCode =()=>{
    return Math.floor(100000 + Math.random()*900000).toString();
};

export const createOtp = async(email)=>{
    await Otp.deleteMany({email});

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now()+5*60*1000);//5min

    await Otp.create({email,otp:otpCode,expiresAt});
    return otpCode;
};
export const verifyOtp = async(email,otpCode)=>{
    const record = await Otp.findOne({email,otp:otpCode});

    if(!record){
        return{
            valid:false,
            message:'Invalid OTP'
        };
    }

    if(record.expiresAt < new Date()){
        await record.deleteOne();
        return{
            valid:false,
            message:'OTP has expired'
        };
    }

    await record.deleteOne();
    return{
        valid:true,
        message:'OTP verified'
    };
};