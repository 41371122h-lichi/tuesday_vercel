const { useState, useEffect, useRef } = React;

const BACKEND_URL = ''; 

const FLIGHT_KEYWORDS = ['查航班', '查機票', '查飛機', '航班資訊', 'TPE', 'NRT', 'BKK', 'KHH', 'DMK', 'ITM', 'FUK'];

const extractIataCodes = (text) => {
    const iataRegex = /[A-Z]{3}/g;
    return text.match(iataRegex) || [];
};

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
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const contents = [...messages, userMessage].map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model', 
            parts: [{ text: msg.text }]
        }));
        
        const isFlightQuery = FLIGHT_KEYWORDS.some(keyword => 
            userMessageText.toUpperCase().includes(keyword)
        );
        const iataCodes = extractIataCodes(userMessageText.toUpperCase());

        let shouldFallBackToChat = true; 

        if (isFlightQuery && iataCodes.length >= 2) {
            shouldFallBackToChat = false; 

            try {
                const dep_iata = iataCodes[0];
                const arr_iata = iataCodes[1];

                // 使用 BACKEND_URL + API 路徑
                const flightResponse = await axios.get(`${BACKEND_URL}/api/flight/schedules`, {
                    params: { dep: dep_iata, arr: arr_iata }
                });

                const flightData = flightResponse.data.data;
                const error = flightResponse.data.error;

                if (error || !flightData || flightData.length === 0) {
                    const errorDetail = error || '無數據返回';
                    const simulationPrompt = `用戶正在查詢 ${dep_iata} 到 ${arr_iata} 的航班，但後端數據服務器返回錯誤或沒有數據 (${errorDetail})。請你以旅遊助手的身份，根據你的內部知識，提供一個友善的、包含模擬航班資訊的回覆。`;
                    
                    const simulationResponse = await axios.post(`${BACKEND_URL}/api/ai/chat`, {
                        contents: [ ...contents, { role: 'user', parts: [{ text: simulationPrompt }] } ] 
                    });

                    const simulationMsg = { role: 'model', text: simulationResponse.data.ai_response };
                    setMessages(prev => [...prev, simulationMsg]);
                    return; 
                }

                // 數據獲取成功
                const analysisResponse = await axios.post(`${BACKEND_URL}/api/ai/process`, {
                    flightData: flightData 
                });

                const aiAnalysis = { role: 'model', text: analysisResponse.data.ai_analysis };
                setMessages(prev => [...prev, aiAnalysis]);

            } catch (networkError) {
                console.error('Frontend Axios Error:', networkError);
                const errorMsg = { role: 'model', text: '無法連接到伺服器。請稍後再試。' };
                setMessages(prev => [...prev, errorMsg]);
            } finally {
                setIsLoading(false);
            }
        } 

        if (shouldFallBackToChat) {
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
        }
    };

    return (
        <div className="kuromi-chat-container"> 
            <h2 className="kuromi-chat-title">✈️ Gemini 旅遊助手 ✈️</h2>
            <div className="kuromi-message-history">
                {messages.length === 0 && (
                    <div className="kuromi-welcome-message">
                        您好！我是您的旅程小助手。不管是行程安排還是航班規劃都可以問我喔😊
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`kuromi-message-bubble-wrapper ${msg.role}`}>
                        <div className="kuromi-message-bubble">{msg.text}</div>
                    </div>
                ))}
                {isLoading && ( 
                    <div className="kuromi-message-bubble-wrapper model">
                        <div className="kuromi-message-bubble thinking-bubble">正在思考...</div>
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
                    placeholder={isLoading ? "AI 正在思考..." : "輸入你的問題... (例如: 查 TPE 到 BKK)"}
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