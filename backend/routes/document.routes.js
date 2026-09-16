import express from 'express';
import { uploadDocument,askQuestion,generateQuiz } from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.post('/:id/ask',protect,askQuestion);
router.post('/:id/quiz',protect,generateQuiz);

export default router;