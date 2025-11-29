// src/App.js

import React from 'react'; 
import './App.css';

// 導入你在 src/AItest.js 中定義的新的 AIChatAssistant 元件
import AIChatAssistant from './AItest'; 
// 注意：由於 AItest.js 是 export default，我們可以隨意命名導入的元件（這裡我們使用 AIChatAssistant）


function App() {
  // 整個 App 介面現在只渲染 AIChatAssistant
  return (
    <div className="App">
      {/* <AIChatAssistant /> 元件包含了整個聊天介面和邏輯 */}
      <AIChatAssistant /> 
    </div>
  );
}

export default App;