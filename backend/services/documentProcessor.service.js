import Document from '../models/Document.js';
import { extractTextFromPdf } from './pdf.service.js';
import { chunkText } from '../utils/chunking.util.js';
import { getEmbedding } from './gemini.service.js';
import { upsertChunks, deleteChunksForDocument } from './pinecone.service.js';

export const processDocument = async (documentId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const text = await extractTextFromPdf(document.fileUrl);

        if (!text || text.trim().length < 20) {
            throw new Error('No readable text found. Scanned/image-only PDFs are not supported.');
        }

        const chunks = chunkText(text);
        console.log(`Extracted ${chunks.length} chunks from document ${documentId}`);

        const records = [];
        for (let i = 0; i < chunks.length; i++) {
            const vector = await getEmbedding(chunks[i]);
            records.push({
                id: `${documentId}-${i}`,
                values: vector,
                metadata: {
                    text: chunks[i],
                    documentId: documentId.toString(),
                    chunkIndex: i,
                },
            });
        }

        await upsertChunks(records);
        console.log(`Stored ${chunks.length} chunk embeddings in Pinecone for document ${documentId}`);

        document.status = 'ready';
        document.errorMessage = undefined;
        await document.save();
    } catch (err) {
        console.error('Document processing failed:', err.message);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed',
            errorMessage: err.message,
        });

        try {
            await deleteChunksForDocument(documentId);
        } catch (cleanupErr) {
            console.error('Pinecone cleanup failed:', cleanupErr.message);
        }

        throw err;
    }
};
