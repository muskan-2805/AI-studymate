export const chunkText = (text, wordsPerChunk =300) => {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
        const chunk = words.slice(i, i + wordsPerChunk).join(' ');
        chunks.push(chunk);
    }

    return chunks;
};