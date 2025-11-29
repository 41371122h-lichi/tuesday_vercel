import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 
import './App.css'; // 確保導入了你的 CSS 檔案

const LOCAL_SERVER_URL = 'http://localhost:3000'; 

// 關鍵字列表，用於觸發前端直接查詢航班服務
const FLIGHT_KEYWORDS = ['查航班', '查機票', '查飛機', '航班資訊', 'TPE', 'NRT', 'BKK', 'KHH', 'DMK', 'ITM', 'FUK'];

// 輔助函數：從文本中提取 IATA 代碼 (三個連續的大寫字母)
const extractIataCodes = (text) => {
    const iataRegex = /[A-Z]{3}/g;
    return text.match(iataRegex) || [];
};

export default function AIChatAssistant() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null); 

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); 

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessageText = input;
        const userMessage = { role: 'user', text: userMessageText };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // 構造完整的對話內容 (用於發送給 AI)
        const contents = [...messages, userMessage].map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model', 
            parts: [{ text: msg.text }]
        }));
        
        const isFlightQuery = FLIGHT_KEYWORDS.some(keyword => 
            userMessageText.toUpperCase().includes(keyword)
        );
        const iataCodes = extractIataCodes(userMessageText.toUpperCase());

        // 流程標籤：用來追蹤是否需要發送普通聊天請求
        let shouldFallBackToChat = true; 

        if (isFlightQuery && iataCodes.length >= 2) {
            // --- 情況 1: 航班查詢流程 (優先嘗試 Aviationstack) ---
            shouldFallBackToChat = false; // 進入此邏輯，表示不走普通聊天

            try {
                const dep_iata = iataCodes[0];
                const arr_iata = iataCodes[1];

                // 1. 呼叫後端 API 獲取實際數據 (/api/flight/schedules)
                const flightResponse = await axios.get(`${LOCAL_SERVER_URL}/api/flight/schedules`, {
                    params: { dep: dep_iata, arr: arr_iata }
                });

                const flightData = flightResponse.data.data;
                const error = flightResponse.data.error;

                if (error || !flightData || flightData.length === 0) {
                    // 數據服務失敗時，回退到 AI 模擬回覆
                    const errorDetail = error || '無數據返回';
                    const simulationPrompt = `用戶正在查詢 ${dep_iata} 到 ${arr_iata} 的航班，但後端數據服務器返回錯誤或沒有數據 (${errorDetail})。請你以旅遊助手的身份，根據你的內部知識，提供一個友善的、包含模擬航班資訊的回覆（例如：列出該航線常見的航空公司和預估時間）。你**必須**提供模擬數據，並提到數據可能不準確，以滿足使用者需求。`;
                    
                    const simulationResponse = await axios.post(`${LOCAL_SERVER_URL}/api/ai/chat`, {
                        // 將所有歷史訊息和模擬指令一起發送給 AI
                        contents: [ ...contents, { role: 'user', parts: [{ text: simulationPrompt }] } ] 
                    });

                    const simulationMsg = { role: 'model', text: simulationResponse.data.ai_response };
                    setMessages(prev => [...prev, simulationMsg]);
                    return; // 流程結束
                }

                // 2. 數據獲取成功：將數據傳給後端 AI 進行分析 (/api/ai/process)
                const analysisResponse = await axios.post(`${LOCAL_SERVER_URL}/api/ai/process`, {
                    flightData: flightData 
                });

                const aiAnalysis = { role: 'model', text: analysisResponse.data.ai_analysis };
                setMessages(prev => [...prev, aiAnalysis]);

            } catch (networkError) {
                // 🚨 關鍵修正點：網路連線徹底失敗，也回退到 AI 模擬
                console.error('Frontend Axios Error (Network/CORS/Server Down):', networkError);
                
                const dep_iata = iataCodes[0];
                const arr_iata = iataCodes[1];
                
                const simulationPrompt = `用戶正在查詢 ${dep_iata} 到 ${arr_iata} 的航班，但後端伺服器網路連線失敗。請你以旅遊助手的身份，根據你的內部知識，提供一個友善的、包含模擬航班資訊的回覆（例如：列出該航線常見的航空公司和預估時間）。你**必須**提供模擬數據，並提到數據可能不準確，以滿足使用者需求。`;
                    
                try {
                    const simulationResponse = await axios.post(`${LOCAL_SERVER_URL}/api/ai/chat`, {
                        // 嘗試發送模擬指令給 AI
                        contents: [ ...contents, { role: 'user', parts: [{ text: simulationPrompt }] } ] 
                    });
                    
                    const simulationMsg = { role: 'model', text: simulationResponse.data.ai_response };
                    setMessages(prev => [...prev, simulationMsg]);
                } catch (finalError) {
                    // 如果連 AI 聊天 API 也失敗 (最壞情況)
                    const errorMsg = { role: 'model', text: '抱歉，後端伺服器已離線，無法進行查詢或聊天。請檢查 $\text{Node.js}$ 伺服器是否運行。' };
                    setMessages(prev => [...prev, errorMsg]);
                }
                
            } finally {
                setIsLoading(false);
            }
        } 

        if (shouldFallBackToChat) {
            // --- 情況 2: 普通聊天流程 (純 Gemini Chat) ---
            
            try {
                const response = await axios.post(`${LOCAL_SERVER_URL}/api/ai/chat`, { contents });

                const aiResponse = { role: 'model', text: response.data.ai_response };
                setMessages(prev => [...prev, aiResponse]);
            } catch (error) {
                console.error('Gemini Chat Error:', error);
                const errorMsg = { role: 'model', text: '抱歉，我的連線出了問題。' };
                setMessages(prev => [...prev, errorMsg]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="kuromi-chat-container"> 
            <h2 className="kuromi-chat-title">
                ✈️ Gemini 旅遊助手 ✈️
            </h2>
            
            {/* 聊天訊息顯示區域 */}
            <div className="kuromi-message-history">
                {messages.length === 0 && (
                    <div className="kuromi-welcome-message">
                        您好！我是您的旅程小助手。不管是行程安排還是航班規劃都可以問我喔😊
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`kuromi-message-bubble-wrapper ${msg.role}`} 
                    >
                        <div className="kuromi-message-bubble"> 
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && ( 
                    <div className="kuromi-message-bubble-wrapper model">
                        <div className="kuromi-message-bubble thinking-bubble">
                            正在思考...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} /> 
            </div>

            {/* 輸入框和發送按鈕 */}
            <div className="kuromi-input-area">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    placeholder={isLoading ? "AI 正在思考..." : "輸入你的問題... (例如: 查 TPE 到 BKK)"}
                    className="kuromi-input-field"
                />
                <button 
                    onClick={sendMessage} 
                    disabled={isLoading}
                    className="kuromi-send-button"
                >
                    發送
                </button>
            </div>
        </div>
    );
}