import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env.js';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (err) => err?.status === 503 || err?.status === 429;

const backoffDelay = (attempt) => 1000 * 2 ** attempt + Math.random() * 500;

export const getEmbedding = async (text, maxRetries = 4) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await model.embedContent(text);
            return result.embedding.values;
        } catch (err) {
            if (!isRetryable(err) || attempt === maxRetries - 1) throw err;
            const delay = backoffDelay(attempt);
            console.warn(`Embedding ${err.status}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
            await sleep(delay);
        }
    }
};

export const generateText = async (prompt, modelName = PRIMARY_MODEL) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
};

async function tryModel(prompt, modelName, maxRetries) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await generateText(prompt, modelName);
        } catch (err) {
            if (!isRetryable(err) || attempt === maxRetries - 1) throw err;

            const delay = backoffDelay(attempt);
            console.warn(`Gemini ${err.status} on ${modelName}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
            await sleep(delay);
        }
    }
}

export async function generateTextWithRetry(prompt, maxRetries = 3) {
    try {
        return await tryModel(prompt, PRIMARY_MODEL, maxRetries);
    } catch (err) {
        if (isRetryable(err) && FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL) {
            console.warn(`${PRIMARY_MODEL} overloaded, falling back to ${FALLBACK_MODEL}`);
            return await tryModel(prompt, FALLBACK_MODEL, maxRetries);
        }
        throw err;
    }
}
