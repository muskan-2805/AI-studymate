import {createRequire} from 'module';
const require = createRequire(import.meta.url); 
const pdfParse = require('pdf-parse');

export const extractTextFromPdf = async (fileUrl) => {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdfParse(buffer);
    return data.text;
};