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

if(!process.env.GMAIL_USER){
    throw new Error('GMAIL_USER is not defined in .env file');
}

if(!process.env.GMAIL_APP_PASSWORD){ 
    throw new Error('GMAIL_APP_PASSWORD is not defined');
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

if(!process.env.GEMINI_API_KEY){
    throw new Error('GEMINI_API_KEY is not defined in .env file');
}

if(!process.env.PINECONE_API_KEY){
    throw new Error('PINECONE_API_KEY is not defined in .env file');
}

if(!process.env.PINECONE_INDEX_NAME){
    throw new Error('PINECONE_INDEX_NAME is not defined in .env file');
}

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const GMAIL_USER = process.env.GMAIL_USER;
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;