import index from "../config/pinecone.js";

export const upsertChunk = async (id, vector, metadata) => {
    await index.upsert({
     records :[
       {
        id: String(id),
        values: vector,
        metadata,
       }
    ]
});
};
    
export const queryTopChunks = async (vector, documentId, topK = 3) => {
    const result = await index.query({
        vector,
        topK,
        filter: { documentId },
        includeMetadata: true,
    });
    return result.matches.map(match => match.metadata.text);
};
export const getAllChunksForDocument = async (documentId,dummyVector)=>{
    const result = await index.query({
        vector:dummyVector,
        topK:20,
        filter: { documentId },
        includeMetadata: true,
    });
    return result.matches.map((match) => match.metadata.text);

};