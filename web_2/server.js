const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.use(bodyParser.json());
// 允許所有來源跨域請求
app.use(cors()); 

app.post('/api/ai/chat', async (req, res) => {
    const { contents } = req.body; 

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
        return res.status(400).json({ message: 'Missing conversation history/prompt.' });
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 簡單的系統提示詞
    const systemInstructionText = `
    你是一位專業、樂於助人且友善的 AI 助手。
    今天的日期是 ${formattedDate}。請用友善的語氣回答使用者的問題。
    `;

    // 強制注入日期資訊
    const dateInjectionMessage = {
        role: 'user', 
        parts: [{ text: `【絕對日期設定】：今天實際的日期是 ${formattedDate}。` }]
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

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;