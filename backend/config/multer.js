import {CloudinaryStorage} from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ai-study-buddy-documents',
        allowed_formats: ['pdf'],
        resource_type: 'raw',
    },
});

const upload = multer({
     storage,
     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
     });

export default upload;