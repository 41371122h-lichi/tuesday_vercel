import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import AiAssistant from './AiAssistant';

function App() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const skillSection = document.querySelector('#skills');
    const progressBars = document.querySelectorAll('.skill-bar-fill');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          progressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
          });
          observer.unobserve(skillSection);
        }
      });
    }, { threshold: 0.5 });

    if (skillSection) {
      observer.observe(skillSection);
    }

    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      let current = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= (sectionTop - 150)) {
          current = section.getAttribute("id");
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      if (skillSection) observer.unobserve(skillSection);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="App">
      <Sidebar activeSection={activeSection} />

      <div className="main">
        
        <section id="resume">
            <h3>RESUME | 簡介</h3>
            <ul>
                <li><span>Education: Technology application and Human resource Dep. & Business Administration Dep. NTNU</span></li>
                <li><span>Language: CHN | ENG | KOR</span></li>
                <li><span>A Content PM Learner</span></li>
                <li><span>A Coding Learner</span></li>
            </ul>
        </section>

        <section id="skills">
            <h3>SKILL | 技能</h3>
            <div className="skill">
                <div className="skill-header">
                    <span className="skill-name">English</span>
                    <span className="skill-value">80%</span>
                </div>
                <div className="skill-bar">
                    <div className="skill-bar-fill" data-width="80%"></div>
                </div>
            </div>

            <div className="skill">
                <div className="skill-header">
                    <span className="skill-name">Korean</span>
                    <span className="skill-value">70%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-bar-fill" data-width="70%"></div>
                </div>
            </div>

             <div className="skill">
                <div className="skill-header">
                    <span className="skill-name">Flute</span>
                    <span className="skill-value">85%</span>
                </div>
                <div className="skill-bar">
                    <div className="skill-bar-fill" data-width="85%"></div>
                </div>
            </div>

            <div className="skill">
                <div className="skill-header">
                    <span className="skill-name">Business-related</span>
                    <span className="skill-value">70%</span>
                </div>
                <div className="skill-bar">
                    <div className="skill-bar-fill" data-width="70%"></div>
                </div>
            </div>
        </section>

        <section id="concert">
            <h3>CONCERT | 音樂會紀錄</h3>
            <ul>
                <li><span>2025-07-16 | 回響二十 · 樂聲不息</span></li>
                <div className="image-container">
                    <img src="https://ppt.cc/fRMpex@jpg" alt="0716音樂會照" />
                </div>
                <p className="concert-text">這次很榮幸可以進到臺中國家歌劇院大劇院進行表演❤</p>
                <a href="https://youtu.be/FUvJJQ78s8U?si=d3J7-qSuSVC9VY5y&t=150" target="_blank" rel="noreferrer">‧ Welcome to the Imagination world</a>
                <a href="https://youtu.be/PV-SuClYtxg?si=MHml0iAmS5pvac0o" target="_blank" rel="noreferrer">‧ Rhapsody for Alto Saxophone</a>
                <a href="https://youtu.be/wECkfGFg3CA?si=ulF-EZchJNcTDGd9&t=165" target="_blank" rel="noreferrer">‧ Sinfonietta No.3 "Distance of Sounds"</a>
                <a href="https://youtu.be/Jd2RVlWTkJw?si=WgpVmZHcZwF9GlLs&t=30" target="_blank" rel="noreferrer">‧ With Heart and Voice</a>
            </ul>

            <br />

            <ul>
                <li><span>2025-07-26 | 樂 · 遇</span></li>
                <div className="image-container">
                    <img src="https://ppt.cc/fg0Z3x@jpg" alt="0726音樂會照" />
                </div>
                <p className="concert-text">被高中學弟妹們邀請回去演出，順便和以前的朋友們聚一聚！</p>
            </ul>

            <br />

            <ul>
                <li><span>2025-08-24 | 音峋</span></li>
                <div className="image-container">
                    <img src="https://ppt.cc/f4PGIx@jpg" alt="0824音樂會照" />
                </div>
                <p className="concert-text">和高中校友團一起演出，還吹了【給莫道克的最後一封信】的Solo!</p>
                <a href="https://youtu.be/MPk9i2lkxIA?si=Dw2CsX33exDUWvOh&t=285" target="_blank" rel="noreferrer">‧ マードックからの最後の手紙</a>
            </ul>
        </section>

        <section id="travel">
            <h3>TRAVEL | 旅行紀錄</h3>
            <ul>
                <li><span>2025/01 Bankok & Pattaya</span></li>
                <div className="image-container">
                    <img src="https://ppt.cc/fyoWpx@jpg" alt="真理寺" />
                </div>
                <p className="concert-text">推薦大家要來泰國、、、這次去了十天含機酒只花兩萬元，超級划算！</p>
                
                {/* 注意：React 的 style 要寫成物件 */}
                <h4 style={{margin:'20px 0 10px', color:'var(--sidebar-bg)'}}>Bangkok</h4>
                <div className="photo-gallery">
                    <div className="photo-item">
                        <img src="https://ppt.cc/firOox@jpg" alt="食物照" />
                        <p className="concert-text">鱷魚肉超級好吃༼☯﹏☯༽</p>
                    </div>
                    <div className="photo-item">
                        <img src="https://ppt.cc/fp595x@jpg" alt="食物照2" />
                        <p className="concert-text">來泰國必吃蟲蟲ψ(｀∇´)ψ</p>
                    </div>
                    <div className="photo-item">
                        <img src="https://ppt.cc/fUIXjx@jpg" alt="食物照3" />
                        <p className="concert-text">猜猜這個在百貨公司裡賣的麵多少錢？</p>
                    </div>
                </div>

                <h4 style={{margin:'20px 0 10px', color:'var(--sidebar-bg)'}}>Pattaya</h4>
                <div className="photo-gallery">
                    <div className="photo-item">
                        <img src="https://ppt.cc/f91aqx@jpg" alt="食物照4" />
                        <p className="concert-text">在海邊看著夕陽吃飯完全是幸福</p>
                    </div>
                    <div className="photo-item">
                        <img src="https://ppt.cc/fWIKox@jpg" alt="景物照1" />
                        <p className="concert-text">個人覺得還行，下次看更刺激的</p>
                    </div>
                    <div className="photo-item">
                        <img src="https://ppt.cc/fw2QEx@jpg" alt="食物照5" />
                        <p className="concert-text">在海邊喝咖啡也是很Chill了</p>
                    </div>
                </div>
            </ul>

            <br />
            <hr style={{border:0, borderTop:'1px dashed var(--accent-gold)', margin:'30px 0'}} />
            <br />

            <ul>
                <li><span>2025/02 Seoul</span></li>
                <div className="image-container">
                    <img src="https://ppt.cc/fXRy1x@jpg" alt="KBS Arena" />
                </div>
                <p className="concert-text">追星女獨自前往韓國的紀錄！</p>
                <div className="image-container">
                    <img src="https://ppt.cc/f5pxOx@jpg" alt="UTY" />
                </div>
                <p className="concert-text">媽呀好近！！完全是幸福的...❤❤❤</p>
                <div className="photo-gallery">
                    <div className="photo-item">
                        <img src="https://ppt.cc/fZPsAx@jpg" alt="食物照6" />
                        <p className="concert-text">沒有人可以拒絕薄巧</p>
                    </div>
                    <div className="photo-item">
                        <img src="https://ppt.cc/fThpbx@jpg" alt="朋友照1" />
                        <p className="concert-text">和韓國朋友一起拍貼❤</p>
                    </div>
                    <div className="photo-item">
                        <img src="https://ppt.cc/fDTvSx@jpg" alt="朋友照2" />
                        <p className="concert-text">漢江公園野餐也是心願之一❤</p>
                    </div>
                    <div className="photo-item">
                        <img src="https://ppt.cc/fwv29x@jpg" alt="朋友照3" />
                        <p className="concert-text">一起去K-beauty Festival❤</p>
                    </div>
                </div>
            </ul>
        </section>

        <section id="ai-assistant">
            <h3>AI ASSISTANT | AI小助手</h3>
            <AiAssistant />
        </section>

      </div>
    </div>
  );
}

export default App;