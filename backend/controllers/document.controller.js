import Document from '../models/Document.js';
import Quiz from '../models/Quiz.js';
import RevisionLog from '../models/RevisionLog.js';
import cloudinary from '../config/cloudinary.js';
import { processDocument } from '../services/documentProcessor.service.js';
import { generateTextWithRetry, getEmbedding } from '../services/gemini.service.js';
import { queryTopChunks, getChunksForQuiz, deleteChunksForDocument } from '../services/pinecone.service.js';
import { isValidObjectId } from '../utils/validate.util.js';

const MAX_QUESTION_LENGTH = 1000;

const findOwnedDocument = async (id, userId) => {
    if (!isValidObjectId(id)) return null;
    return Document.findOne({ _id: id, user: userId });
};

const aiErrorResponse = (res, err, fallbackMessage) => {
    const status = err?.status === 503 || err?.status === 429 ? 503 : 500;
    const message =
        status === 503
            ? 'AI service is temporarily busy, please try again in a moment'
            : fallbackMessage;
    return res.status(status).json({ message, error: err.message });
};

const validateQuestions = (questions) => {
    if (!Array.isArray(questions) || questions.length === 0) return false;
    return questions.every(
        (q) =>
            q &&
            typeof q.question === 'string' &&
            q.question.trim() &&
            Array.isArray(q.options) &&
            q.options.length >= 2 &&
            q.options.every((o) => typeof o === 'string' && o.trim()) &&
            Number.isInteger(q.correctAnswerIndex) &&
            q.correctAnswerIndex >= 0 &&
            q.correctAnswerIndex < q.options.length
    );
};

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const title = (typeof req.body.title === 'string' && req.body.title.trim()) || req.file.originalname;

        const document = await Document.create({
            user: req.user._id,
            title,
            fileUrl: req.file.path,
            publicId: req.file.filename,
            status: 'processing',
        });

        res.status(201).json({
            message: 'Document uploaded successfully, processing',
            document,
        });

        processDocument(document._id).catch((err) => {
            console.error('Processing document failed:', err.message);
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const askQuestion = async (req, res) => {
    try {
        const question = typeof req.body.question === 'string' ? req.body.question.trim() : '';
        const { id: documentId } = req.params;

        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }
        if (question.length > MAX_QUESTION_LENGTH) {
            return res.status(400).json({ message: `Question is too long (max ${MAX_QUESTION_LENGTH} characters)` });
        }

        const document = await findOwnedDocument(documentId, req.user._id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (document.status !== 'ready') {
            return res.status(409).json({ message: 'Document is not ready yet' });
        }

        const questionVector = await getEmbedding(question);
        const topChunks = await queryTopChunks(questionVector, documentId, 3);

        if (topChunks.length === 0) {
            return res.status(404).json({ message: 'No relevant content found for this document' });
        }

        const prompt = `Answer the question using only the context below. If the answer isn't in the context, say "I don't know based on the provided notes."

Context:
${topChunks.join('\n---\n')}

Question: ${question}`;

        const answer = await generateTextWithRetry(prompt);

        res.status(200).json({ answer });
    } catch (err) {
        console.error('askQuestion error:', err);
        aiErrorResponse(res, err, 'Answer generation failed');
    }
};

export const generateQuiz = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const { numQuestions = 5 } = req.body || {};

        const count = Math.min(Math.max(parseInt(numQuestions) || 5, 1), 20);

        const document = await findOwnedDocument(documentId, req.user._id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (document.status !== 'ready') {
            return res.status(409).json({ message: 'Document is not ready yet' });
        }

        const dummyVector = await getEmbedding('summary of document content');
        const chunks = await getChunksForQuiz(documentId, dummyVector, 20);

        if (chunks.length === 0) {
            return res.status(404).json({ message: 'No content found for this document' });
        }
        const combinedText = chunks.join('\n\n');

        const prompt = `Generate ${count} multiple-choice questions based on this text.
Each question must have exactly 4 options and exactly one correct answer.
Respond ONLY with valid JSON in this exact format, no extra text, no markdown formatting:
[{"question":"...","options":["...","...","...","..."],"correctAnswerIndex":0}]

Text:
${combinedText}`;

        let questions = null;
        for (let attempt = 0; attempt < 2 && !questions; attempt++) {
            const raw = await generateTextWithRetry(prompt);
            const clean = raw.replace(/```json|```/g, '').trim();
            try {
                const parsed = JSON.parse(clean);
                if (validateQuestions(parsed)) questions = parsed;
            } catch {
            }
        }

        if (!questions) {
            return res.status(502).json({ message: 'Could not generate a valid quiz this time, please try again' });
        }

        const quiz = await Quiz.create({ document: documentId, user: req.user._id, questions });

        res.status(201).json(quiz);
    } catch (err) {
        console.error('generateQuiz error:', err);
        aiErrorResponse(res, err, 'Quiz generation failed');
    }
};

export const getUserDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getUserQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ user: req.user._id })
            .populate('document', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json(quizzes);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getQuizById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.quizId)) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const quiz = await Quiz.findOne({ _id: req.params.quizId, user: req.user._id }).populate('document', 'title');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.status(200).json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await findOwnedDocument(id, req.user._id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await Quiz.deleteMany({ document: id, user: req.user._id });
        await RevisionLog.deleteMany({ document: id, user: req.user._id });

        try {
            await deleteChunksForDocument(id);
        } catch (err) {
            console.error('Failed to delete Pinecone vectors for document:', err.message);
        }

    
        if (document.publicId) {
            try {
                await cloudinary.uploader.destroy(document.publicId, { resource_type: 'raw' });
            } catch (err) {
                console.error('Failed to delete Cloudinary file:', err.message);
            }
        }

        await document.deleteOne();

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error('deleteDocument error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        if (!isValidObjectId(quizId)) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const quiz = await Quiz.findOne({ _id: quizId, user: req.user._id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        await quiz.deleteOne();

        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.error('deleteQuiz error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
