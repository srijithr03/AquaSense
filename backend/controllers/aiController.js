const { GoogleGenAI } = require('@google/genai');

exports.chat = async (req, res) => {
    try {
        const { prompt, historyData } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API Key is missing in backend configuration.' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const systemInstruction = `You are the AquaSense AI Assistant, an expert in water management and conservation. 
You are analyzing the following recent water usage data (last 30 days):
${JSON.stringify(historyData, null, 2)}

Provide helpful, insightful answers to the user's queries based on this data.`;

        let response;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: { systemInstruction: systemInstruction, temperature: 0.7 }
            });
        } catch (fallbackError) {
            console.warn(`Primary model failed (${fallbackError.message}), falling back to gemini-3.5-flash...`);
            response = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
                config: { systemInstruction: systemInstruction, temperature: 0.7 }
            });
        }

        res.status(200).json({ reply: response.text });
    } catch (error) {
        console.error('=== Error in AI Chat ===');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        if (error.status) console.error('API Status:', error.status);
        console.error('========================');
        
        res.status(500).json({ 
            error: 'Failed to process AI request',
            details: error.message,
            stack: error.stack
        });
    }
};
