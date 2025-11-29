const express = require('express');
const bodyParser = require('body-parser');
const apiService = require('./apiService'); 
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.use(bodyParser.json());
app.use(cors()); 

app.post('/api/ai/chat', async (req, res) => {
    const { contents } = req.body; 

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
        return res.status(400).json({ message: 'Missing conversation history/prompt.' });
    }

    // 1. 獲取當前日期
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 2. 簡化 System Instruction (移除所有工具強制要求)
    const systemInstructionText = `
    你是一位專業、樂於助人且友善的旅遊 AI 助手。
    今天的日期是 ${formattedDate}。請根據此日期和對話歷史進行簡潔、連貫的回覆。
    `;

    // 3. 構造最終的 Contents 陣列 (包含日期注入) 
    const dateInjectionMessage = {
        role: 'user', 
        parts: [{ text: `【絕對日期設定】：今天實際的日期是 ${formattedDate}。你必須將此日期視為當前日期。` }]
    };
    const augmentedContents = [ dateInjectionMessage, ...contents ];
    
    try {
        // 呼叫 Gemini 模型，不再傳遞 tools 參數
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
    // 接收前端傳來的整個航班數據
    const { flightData } = req.body; 

    if (!flightData) {
        return res.status(400).json({ message: 'Missing flight data in request body.' });
    }

    try {
        console.log("--- DEBUG: 接收到的 contents ---", JSON.stringify(contents));
        // 1. 構建給 AI 的指令 (Prompt)
        const prompt = `你是一個專業的旅遊助手。請分析以下 JSON 格式的航班時刻表數據，並以友善、簡潔的中文，向使用者推薦最適合的 3 班航班。請突出航班號、航空公司和出發時間。數據: ${JSON.stringify(flightData)}`;

        // 2. 呼叫 Gemini 模型進行分析
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        // 3. 返回 AI 的分析結果
        res.json({ ai_analysis: response.text });
        
    } catch (error) {
        console.error('--- GEMINI ERROR START ---'); 
        console.error('Gemini AI Processing Error:', error.message);
        
        // **最重要：打印 Gemini 呼叫的詳細錯誤**
        if (error.response && error.response.data) {
             console.error('Gemini detailed error response:', error.response.data);
        } else {
             console.error('Full Gemini Error Object:', error); 
        }

        console.error('--- GEMINI ERROR END ---'); 

        res.status(500).json({ 
            message: 'Failed to process data with Gemini AI.', 
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints ready.`);
});