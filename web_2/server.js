const express = require('express');
const bodyParser = require('body-parser');
const apiService = require('./apiService'); 
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.use(bodyParser.json());
app.use(cors()); 

app.get('/api/flight/schedules', async (req, res) => {
    try {
        const { dep, arr } = req.query;

        const flightData = await apiService.getFlightSchedule(dep, arr);
        
        res.json({ data: flightData });
    } catch (error) {
        console.error('Flight API Error:', error);
        res.json({ error: error.message, data: [] });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    const { contents } = req.body; 

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
        return res.status(400).json({ message: 'Missing conversation history/prompt.' });
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const systemInstructionText = `
    你是一位專業、樂於助人且友善的旅遊 AI 助手。
    今天的日期是 ${formattedDate}。請根據此日期和對話歷史進行簡潔、連貫的回覆。
    `;

    const dateInjectionMessage = {
        role: 'user', 
        parts: [{ text: `【絕對日期設定】：今天實際的日期是 ${formattedDate}。你必須將此日期視為當前日期。` }]
    };
    const augmentedContents = [ dateInjectionMessage, ...contents ];
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            systemInstruction: systemInstructionText,
            contents: augmentedContents,
        });

        res.json({ ai_response: response.text }); 

    } catch (error) {
        console.error('--- GEMINI CHAT ERROR START ---', error.message); 
        res.status(500).json({ 
            message: 'Failed to process chat request with Gemini AI.', 
            details: error.message 
        });
    }
});

app.post('/api/ai/process', async (req, res) => {
    const { flightData } = req.body; 

    if (!flightData) {
        return res.status(400).json({ message: 'Missing flight data in request body.' });
    }

    try {
        console.log("--- DEBUG: Processing Flight Data ---");
        
        const prompt = `你是一個專業的旅遊助手。請分析以下 JSON 格式的航班時刻表數據，並以友善、簡潔的中文，向使用者推薦最適合的 3 班航班。請突出航班號、航空公司和出發時間。數據: ${JSON.stringify(flightData)}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        res.json({ ai_analysis: response.text });
        
    } catch (error) {
        console.error('--- GEMINI PROCESS ERROR ---', error.message); 
        res.status(500).json({ 
            message: 'Failed to process data with Gemini AI.', 
            details: error.message 
        });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;