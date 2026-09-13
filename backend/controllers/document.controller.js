import Document from '../models/Document.js';
import {processDocument} from '../services/documentProcessor.service.js';

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