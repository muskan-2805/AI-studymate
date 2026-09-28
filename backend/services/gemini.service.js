import {GoogleGenerativeAI} from '@google/generative-ai';
import {GEMINI_API_KEY} from '../config/env.js';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);// creates one authenticated client for whole app using Api key

export const getEmbedding = async (text) => {
    const model = genAI.getGenerativeModel({model:'gemini-embedding-001'});//selects google dedicated embedding model not a chat model(specifically trained to turns text into vector)
    const result = await model.embedContent(text);//sends text to gemini,gets back vector representation 
    return result.embedding.values;//actual array of numbers representing the text in vector
};

export const generateText = async(prompt)=>{
    const model = genAI.getGenerativeModel({model:'gemini-3.6-flash'});
    const result = await model.generateContent(prompt);
    return result.response.text();
};

export async function generateTextWithRetry(prompt, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await generateText(prompt);
        } catch (err) {
            const is503 = err?.status === 503;
            const isLastAttempt = attempt === maxRetries - 1;

            if (!is503 || isLastAttempt) {
                throw err;
            }

            const delay = 1000 * Math.pow(2, attempt);
            console.warn(`Gemini 503, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}