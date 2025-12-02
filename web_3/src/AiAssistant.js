import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

const AiAssistant = () => {
    const [apiKey, setApiKey] = useState('');
    const [input, setInput] = useState(''); 
    const [messages, setMessages] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const bottomRef = useRef(null);
    useEffect(() => {
        if (messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (customText = null) => {
        if (!apiKey) {
            setError('請先輸入 API Key 喔！');
            return;
        }

        const textToSend = (typeof customText === 'string') ? customText : input;

        if (!textToSend.trim()) return;

        const userMessage = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        
        setInput('');
        setLoading(true);
        setError('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const historyForApi = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const chat = model.startChat({
                history: historyForApi,
            });

            const result = await chat.sendMessage(textToSend);
            const responseText = result.response.text();

            setMessages(prev => [...prev, { role: 'model', text: responseText }]);

        } catch (err) {
            console.error(err);
            setError(`發生錯誤：${err.message || err.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="ai-container">
            {/* API Key 輸入區 */}
            <div style={{ marginBottom: '15px' }}>
                <input 
                    type="password" 
                    placeholder="請在此輸入您的 Gemini API Key... (向瀏覽器發送請求！)" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="custom-input key-input"
                />
            </div>

            {/* === 聊天視窗區域 === */}
            <div className="chat-window">
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#888', marginTop: '20px', fontStyle: 'italic' }}>
                        開始跟我聊天吧！
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.role}`}>
                        <div className={`message-bubble ${msg.role}`}>
                            {msg.role === 'model' ? (
                                <div className="markdown-content">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}
                
                {/* 載入中動畫 */}
                {loading && (
                    <div className="message-row model">
                        <div className="message-bubble model typing">
                            正在思考...
                        </div>
                    </div>
                )}
                
                {/* 錯誤訊息 */}
                {error && <div style={{ color: '#ff6b6b', textAlign: 'center', margin: '10px' }}>{error}</div>}
                
                {/* 這是隱藏的元素，用來定位捲軸底部 */}
                <div ref={bottomRef} />
            </div>

            {/* === 底部輸入區 === */}
            <div className="input-area">
                <textarea 
                    placeholder="輸入訊息..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="custom-input chat-input"
                    rows="1"
                />
                <button 
                    onClick={() => handleSend()} 
                    disabled={loading}
                    className="custom-button send-btn"
                >
                    ➤
                </button>
            </div>

            {/* === 預設問題按鈕 === */}
            <div className="suggestions-container">
                <button 
                    className="suggestion-chip"
                    onClick={() => handleSend("去泰國曼谷推薦去哪玩？")}
                    disabled={loading}
                >
                    ✦ 去泰國曼谷推薦去哪玩？
                </button>

                <button 
                    className="suggestion-chip"
                    onClick={() => handleSend("幫我科普SF9這個團體")}
                    disabled={loading}
                >
                    ✦ 幫我科普SF9這個團體
                </button>
            </div>

        </div>
    );
};

export default AiAssistant;