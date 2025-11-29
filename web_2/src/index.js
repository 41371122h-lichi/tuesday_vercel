import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; 
import reportWebVitals from './reportWebVitals'; 


const el = document.getElementById('react-root'); 
if (el) {
    createRoot(el).render(<App />); 
}
reportWebVitals();