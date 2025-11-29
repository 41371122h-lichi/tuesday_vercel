require('dotenv').config();
const axios = require('axios');
const ACCESS_KEY = process.env.AVIATIONSTACK_KEY;

// Aviationstack 的基礎 API URL
const BASE_URL = 'http://api.aviationstack.com/v1'; 

/**
 * 查詢航班時刻表 (Schedules)
 * @param {string} dep_iata - 出發機場 IATA 代碼 (e.g., 'TPE')
 * @param {string} arr_iata - 目的機場 IATA 代碼 (e.g., 'NRT')
 * @param {string} flight_date - 日期 YYYY-MM-DD (選填)
 */
async function getFlightSchedules(dep_iata, arr_iata, flight_date) {
    // 檢查 IATA 代碼 (這段是正確的)
    if (!dep_iata || !arr_iata) {
        return { error: 'Missing departure or arrival airport code.' };
    }
    
    // 檢查 API 金鑰是否載入
    if (!ACCESS_KEY) {
    return { error: 'Aviationstack API key not loaded. Check your .env file.' };
    }
    
    try {
        let params = {
            access_key: ACCESS_KEY,
            flight_status: 'scheduled', 
            limit: 20 
        };

        // 檢查並添加 dep_iata
        if (dep_iata) {
            params.dep_iata = dep_iata; 
        } 
        
        // ✅ 修正點：檢查並添加 arr_iata
        if (arr_iata) {
            params.arr_iata = arr_iata;
        }

        // 檢查並添加 flight_date
        if (flight_date) {
            params.flight_date = flight_date;
        }

        // 發送請求
        const response = await axios.get(`${BASE_URL}/flights`, {
            params: params
        });

        // 返回航班數據
        return response.data; 

    } catch (error) { 
        console.error('--- API SERVICE ERROR START ---'); 
        console.error('Error fetching flight schedules:', error.message);
        
        if (error.response) {
            console.error('Aviationstack Status:', error.response.status);
            console.error('Aviationstack Data:', error.response.data); 
             
             if (error.response.status === 403) {
                 return { error: 'Access Forbidden (403). Check API key and free tier limitations.' };
             }
        }
        
        console.error('--- API SERVICE ERROR END ---');
        return { error: 'Failed to connect to Aviationstack. Check API key and network connection.' };
    }
}

module.exports = {
    getFlightSchedules
};