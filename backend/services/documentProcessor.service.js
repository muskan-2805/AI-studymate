import Document from '../models/Document.js';
import { extractTextFromPdf } from './pdf.service.js';
import { chunkText } from '../utils/chunking.util.js';
import { getEmbedding } from './gemini.service.js';
import { upsertChunk } from './pinecone.service.js';

export const processDocument = async (documentId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const text = await extractTextFromPdf(document.fileUrl);
        const chunks = chunkText(text);

        console.log(`Extracted ${chunks.length} chunks from document ${documentId}`);

        for (let i = 0; i < chunks.length; i++){
            const vector = await getEmbedding(chunks[i]);
            const chunkId = `${documentId}-${i}`;

            await upsertChunk(chunkId, vector, { 
                text: chunks[i], 
                documentId: documentId.toString(),
            });
        }

        console.log(`Stored ${chunks.length} chunk embeddings in Pinecone for document ${documentId}`);

        document.status ='ready';
        await document.save();

    } catch (err) {
        console.error('Document processing failed:', err.message);

        await Document.findByIdAndUpdate(documentId, { status: 'failed' });
        throw err;
    }
};