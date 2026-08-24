const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function main() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: 'Hello'
        });
        console.log('Success with gemini-1.5-flash:', response.text);
    } catch (e) {
        console.error('Error with 1.5-flash:', e.message);
    }

    try {
        // According to the new genai SDK, we might need a different model name.
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: 'Hello'
        });
        console.log('Success with gemini-1.5-pro:', response.text);
    } catch (e) {
        console.error('Error with 1.5-pro:', e.message);
    }
}
main();
