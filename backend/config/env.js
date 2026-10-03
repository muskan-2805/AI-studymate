import dotenv from "dotenv";
dotenv.config();

const required = [
    "MONGO_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "GEMINI_API_KEY",
    "PINECONE_API_KEY",
    "PINECONE_INDEX_NAME",
];

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`${key} is not defined in .env file`);
    }
}

const hasBrevo = Boolean(process.env.BREVO_API_KEY);
const hasGmail = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
if (!hasBrevo && !hasGmail) {
    throw new Error('Set BREVO_API_KEY (with MAIL_FROM_EMAIL), or GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
}
if (hasBrevo && !process.env.MAIL_FROM_EMAIL) {
    throw new Error('MAIL_FROM_EMAIL is required when BREVO_API_KEY is set (use your verified Brevo sender email)');
}

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PROD = NODE_ENV === "production";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const MONGO_URI = process.env.MONGO_URI;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const GMAIL_USER = process.env.GMAIL_USER;
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
export const BREVO_API_KEY = process.env.BREVO_API_KEY;
export const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL;
export const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'AI Study Buddy';
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
