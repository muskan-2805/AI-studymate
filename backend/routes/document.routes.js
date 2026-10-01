import express from 'express';
import {
    uploadDocument, askQuestion, generateQuiz, getUserDocuments,
    getUserQuizzes, getQuizById, deleteDocument, deleteQuiz,
} from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { aiLimiter } from '../middleware/rateLimit.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/quiz/:quizId', protect, getQuizById);
router.delete('/quiz/:quizId', protect, deleteQuiz);
router.get('/quizzes/all', protect, getUserQuizzes);
router.post('/:id/quiz', protect, aiLimiter, generateQuiz);
router.post('/:id/ask', protect, aiLimiter, askQuestion);
router.get('/', protect, getUserDocuments);
router.delete('/:id', protect, deleteDocument);

export default router;
