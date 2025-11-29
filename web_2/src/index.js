import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; 
import reportWebVitals from './reportWebVitals'; 

const el = document.getElementById('root-backup'); 
if (el) {
    createRoot(el).render(<App />); 
}

reportWebVitals();