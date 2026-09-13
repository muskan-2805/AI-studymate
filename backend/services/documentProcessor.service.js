import Document from '../models/Document.js';
import { extractTextFromPdf } from './pdf.service.js';
import { chunkText } from '../utils/chunking.util.js';

export const processDocument = async (documentId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const text = await extractTextFromPdf(document.fileUrl);
        const chunks = chunkText(text);

        console.log(`Extracted ${chunks.length} chunks from document ${documentId}`);

        document.status ='ready';
        await document.save();

        return chunks;
    } catch (err) {
        console.error('Document processing failed:', err.message);

        await Document.findByIdAndUpdate(documentId, { status: 'failed' });
        throw err;
    }
};