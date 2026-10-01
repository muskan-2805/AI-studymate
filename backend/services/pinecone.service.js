import index from '../config/pinecone.js';

const UPSERT_BATCH_SIZE = 50;

export const upsertChunks = async (records) => {
    for (let i = 0; i < records.length; i += UPSERT_BATCH_SIZE) {
        const batch = records.slice(i, i + UPSERT_BATCH_SIZE).map((r) => ({
            id: String(r.id),
            values: r.values,
            metadata: r.metadata,
        }));
        await index.upsert({ records: batch });
    }
};

export const queryTopChunks = async (vector, documentId, topK = 3) => {
    const result = await index.query({
        vector,
        topK,
        filter: { documentId: String(documentId) },
        includeMetadata: true,
    });
    return result.matches.map((match) => match.metadata.text);
};

export const getChunksForQuiz = async (documentId, dummyVector, maxChunks = 20) => {
    const result = await index.query({
        vector: dummyVector,
        topK: 100,
        filter: { documentId: String(documentId) },
        includeMetadata: true,
    });

    let matches = result.matches.filter((m) => m.metadata?.text);
    matches.sort((a, b) => (a.metadata.chunkIndex ?? 0) - (b.metadata.chunkIndex ?? 0));

    if (matches.length > maxChunks) {
        const step = matches.length / maxChunks;
        matches = Array.from({ length: maxChunks }, (_, i) => matches[Math.floor(i * step)]);
    }

    return matches.map((m) => m.metadata.text);
};

export const deleteChunksForDocument = async (documentId) => {
    await index.deleteMany({ filter: { documentId: String(documentId) } });
};
