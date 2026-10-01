export const chunkText = (text, wordsPerChunk = 300, overlap = 50) => {
    const words = (text || "").split(/\s+/).filter(Boolean);
    const chunks = [];
    const step = Math.max(wordsPerChunk - overlap, 1);

    for (let i = 0; i < words.length; i += step) {
        const chunk = words.slice(i, i + wordsPerChunk).join(" ");
        if (chunk.trim()) chunks.push(chunk);
        if (i + wordsPerChunk >= words.length) break;
    }

    return chunks;
};
