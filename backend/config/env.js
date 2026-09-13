import dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI is not defined in .env file');
}

if(!process.env.JWT_ACCESS_SECRET){
    throw new Error('JWT_ACCESS_SECRET is not defined in .env file');
}

if(!process.env.JWT_REFRESH_SECRET){
    throw new Error('JWT_REFRESH_SECRET is not defined in .env file');
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error('GOOGLE_CLIENT_ID is not defined in .env file');
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error('GOOGLE_CLIENT_SECRET is not defined in .env file');
}

if(!process.env.GOOGLE_REFRESH_TOKEN){
    throw new Error('GOOGLE_REFRESH_TOKEN is not defined in .env file');
}

if(!process.env.GOOGLE_USER){
    throw new Error('GOOGLE_USER is not defined in .env file');
}

if(!process.env.CLOUDINARY_CLOUD_NAME){
    throw new Error('CLOUDINARY_CLOUD_NAME is not defined in .env file');
}

if(!process.env.CLOUDINARY_API_KEY){
    throw new Error('CLOUDINARY_API_KEY is not defined in .env file');
}

if(!process.env.CLOUDINARY_API_SECRET){
    throw new Error('CLOUDINARY_API_SECRET is not defined in .env file');
}

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
export const GOOGLE_USER = process.env.GOOGLE_USER;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;