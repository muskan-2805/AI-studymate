import Document from '../models/Document.js';
import {processDocument} from '../services/documentProcessor.service.js';
import {getEmbedding,generateText} from '../services/gemini.service.js';
import {queryTopChunks} from '../services/pinecone.service.js';
import { getAllChunksForDocument } from '../services/pinecone.service.js';
import Quiz from '../models/Quiz.js';

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded'
            });
        }
        const document = await Document.create({
            user: req.user._id,
            title: req.body.title||req.file.originalname,
            fileUrl: req.file.path,
            status: 'processing',
        });

        res.status(201).json({
            message: 'Document uploaded successfully, processing',
            document,
        });

        processDocument(document._id).catch((err)=>{
            console.error('Processing document failed:', err.message);
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error', error: err.message
        });
    }
};

export const askQuestion = async(req,res)=>{
    try{
        const {question}=req.body;
        const {id:documentId}=req.params;

        if(!question){
            res.status(400).json({
                message:'Question is required'
            });
        }

        const questionVector = await getEmbedding(question);
        const topChunks = await queryTopChunks(questionVector,documentId,3);

        if(topChunks.length===0){
            return res.status(404).json({
                message:'No relevant content found for this document'
            });
        }
        const prompt = `Answer the question using only the context below.If the answer isn't in the context,say"I don't know based on the provided notes."
        Context:
        ${topChunks.join('\n---\n')}
        Question:${question}`;

        const answer = await generateText(prompt);

        res.status(200).json({answer});
    }catch(err){
        res.status(500).json({
            message:'Server error',error:err.message
        });
    }
};

export const generateQuiz = async(req,res)=>{
    try{
        const {id:documentId}=req.params;
        const {numQuestions = 5} = req.body||{};

        const count = Math.min(Math.max(parseInt(numQuestions)||5,1),20);

        const dummyVector = await getEmbedding('summary of document content');
        const chunks = await getAllChunksForDocument(documentId,dummyVector);

        if(chunks.length===0){
            return res.status(404).json({
                message:'No content found for this document'
            });
        }
        const combinedText = chunks.join('\n\n');

        const prompt =`Generate ${count} multiple-choice questions based on this text.
        Respond ONLY with valid JSON in this exact format,no extra text,no markdown forrmatting:
        [{"question":"...","options":["...","...","...","..."],"correctAnswerIndex":0}]
        
        Text:${combinedText}`;

        const raw = await generateText(prompt);
        const clean = raw.replace(/```json|```/g,'').trim();
        const questions = JSON.parse(clean);

        const quiz = await Quiz.create({document:documentId,questions});

        res.status(201).json(quiz);
    }catch(err){
        res.status(500).json({
            message:'Quiz generation failed',error:err.message
        });
    }
};

export const getUserDocuments = async(req,res)=>{
    try{
        const documents = await Document.find({
            user:req.user._id
        }).sort({
            createdAt:-1
        });
        res.status(200).json(documents);
    }catch(err){
        res.status(500).json({
            message:'Server error',error:err.message
        });
    }
};