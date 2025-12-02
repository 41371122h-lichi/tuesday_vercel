import React, { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';
import './App.css'; 

const Sidebar = ({ activeSection }) => {
  const el = useRef(null);
  const iframeRef = useRef(null); 

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ["Student.", "PM Dreamer.", "Musician.", "Traveler."],
      typeSpeed: 70,
      backSpeed: 70,
      loop: true,
      backDelay: 5000
    });
    return () => {
      typed.destroy();
    };
  }, []);

  useEffect(() => {
    if (!iframeRef.current) return;

    const command = isMusicPlaying ? 'playVideo' : 'pauseVideo';
 
    iframeRef.current.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: command,
      args: []
    }), '*');
    
  }, [isMusicPlaying]); 

  return (
    <div className="sidebar">

      <div className="profile-container">
          <button 
            className={`music-btn ${isMusicPlaying ? 'playing' : ''}`} 
            onClick={() => setIsMusicPlaying(!isMusicPlaying)}
            title={isMusicPlaying ? "暫停音樂" : "播放音樂"}
          >
            {isMusicPlaying ? '❚❚' : '▶'}
          </button>

          <img src="https://ppt.cc/fCsa3x@jpg" alt="樂琦大頭照" />
      </div>

      <h1>施樂琦</h1>
      <h2>Lechi.S</h2>

      <p>
        I'm a <span ref={el}></span>
      </p>

      <nav className="sidebar-nav">
        <a href="#resume" className={activeSection === 'resume' ? 'active' : ''}>RESUME</a>
        <a href="#skills" className={activeSection === 'skills' ? 'active' : ''}>SKILLS</a>
        <a href="#concert" className={activeSection === 'concert' ? 'active' : ''}>CONCERT</a>
        <a href="#travel" className={activeSection === 'travel' ? 'active' : ''}>TRAVEL</a>
        <a href="#ai-assistant" className={activeSection === 'ai-assistant' ? 'active' : ''}>AI BOT</a>
      </nav>

      <div className="socials">
        <a href="https://www.instagram.com/li_chi.21/" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://www.dcard.tw/@lichi21" target="_blank" rel="noreferrer">Dcard</a>
      </div>

      <div className="bottom-text">
        © <span id="year">2025</span> copyright by Lechi.S
      </div>

      <div style={{
        position: 'fixed',
        bottom: '0',
        right: '0',
        width: '1px',
        height: '1px',
        zIndex: -1,      
        opacity: 0.001,  
        pointerEvents: 'none'
      }}>
        <iframe 
          ref={iframeRef} 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/8sJk9AE82kc?enablejsapi=1&controls=0&loop=1&playlist=8sJk9AE82kc" 
          title="YouTube background music" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
        ></iframe>
      </div>

    </div>
  );
};

export default Sidebar;