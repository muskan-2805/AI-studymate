import Document from '../models/Document.js';
import {processDocument} from '../services/documentProcessor.service.js';
import {getEmbedding,generateText} from '../services/gemini.service.js';
import {queryTopChunks} from '../services/pinecone.service.js';

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