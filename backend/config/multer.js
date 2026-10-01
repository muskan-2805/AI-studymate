import { CloudinaryStorage } from 'multer-storage-cloudinary';
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

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        return cb(null, true);
    }
    const err = new Error('Only PDF files are allowed');
    err.code = 'INVALID_FILE_TYPE';
    cb(err);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;
