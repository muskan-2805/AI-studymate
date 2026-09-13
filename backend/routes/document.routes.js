import express from 'express';
import { uploadDocument } from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadDocument);

export default router;