import axios from 'axios';

const binanceApi = axios.create({
    baseURL: 'https://api.binance.com/api/v3',
    timeout: 5000,
});

export default binanceApi;