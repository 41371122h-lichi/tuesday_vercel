// 1. 移除所有的 import，改用全域變數 (CDN 模式)
const { useState, useEffect, useRef } = React;

// ==========================================
// ⚠️ 後端伺服器網址
// ==========================================
// 使用相對路徑 (空字串)，瀏覽器會自動連線到同一個網域下的 /api
// 這樣無論在本機還是 Vercel 都能正常運作 (前提是 server.js 也一起跑起來)
const BACKEND_URL = ''; 

function AIChatAssistant() {
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
        
        // 1. 先把使用者的訊息顯示在畫面上
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // 2. 準備要傳給後端的對話紀錄
        const contents = [...messages, userMessage].map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model', 
            parts: [{ text: msg.text }]
        }));
        
        // 3. 直接發送給 AI 聊天 API
        try {
            const response = await axios.post(`${BACKEND_URL}/api/ai/chat`, { contents });
            const aiResponse = { role: 'model', text: response.data.ai_response };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Gemini Chat Error:', error);
            const errorMsg = { role: 'model', text: '連線錯誤，請稍後再試。' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="kuromi-chat-container"> 
            <h2 className="kuromi-chat-title">✨ Gemini AI 小助手 ✨</h2>
            <div className="kuromi-message-history">
                {messages.length === 0 && (
                    <div className="kuromi-welcome-message">
                        您好！我是您的 AI 小助手。有什麼我可以幫您的嗎？😊
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`kuromi-message-bubble-wrapper ${msg.role}`}>
                        <div className="kuromi-message-bubble">{msg.text}</div>
                    </div>
                ))}
                {isLoading && ( 
                    <div className="kuromi-message-bubble-wrapper model">
                        <div className="kuromi-message-bubble thinking-bubble">AI 正在思考...</div>
                    </div>
                )}
                <div ref={messagesEndRef} /> 
            </div>
            <div className="kuromi-input-area">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    placeholder={isLoading ? "AI 正在思考..." : "輸入您的問題..."}
                    className="kuromi-input-field"
                />
                <button onClick={sendMessage} disabled={isLoading} className="kuromi-send-button">
                    發送
                </button>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(<AIChatAssistant />);