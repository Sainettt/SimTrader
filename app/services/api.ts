import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://10.0.2.2:4000/api'; 

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const $api = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: {
    'Content-Type': 'application/json',
  }
});

$api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
        return Promise.reject(error);
    }
    if (
        error.message === 'Network Error' || 
        error.code === 'ECONNABORTED' || 
        (error.response && error.response.status >= 500)
    ) {
      
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;

        const delay = 1000 * (2 ** (originalRequest._retryCount - 1));
        
        console.log(`[Mobile] Server not responding. Try #${originalRequest._retryCount} again in ${delay}ms`);
        
        await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
        return $api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);


// --- API METHODS ---
export const authAPI = {
    async registration(userName: string, email: string, password: string) {
        const response = await $api.post('auth/registration', { userName, email, password });
        return response.data;
    },

    async login(email: string, password: string) {
        const response = await $api.post('auth/login', { email, password });
        return response.data;
    }
};

export const currencyAPI = {
    async getTopCryptos(limit: number = 100) {
        const response = await $api.get(`/currency/list?limit=${limit}`);
        return response.data;
    },
    async getHistory(symbol: string, period: string) {
        const response = await $api.get(`/currency/history`, {
            params: { symbol, period }
        });
        return response.data;
    },
    async getLatestPrice(symbol: string) {
        const response = await $api.get('/currency/rate', {
            params: { symbol: symbol.includes('USDT') ? symbol : `${symbol}USDT` } 
        });
        return response.data;
    }
};

export const walletAPI = {
    async topUp(userId: number, amount: number) {
        const response = await $api.post('/wallet/top-up', { userId, amount });
        return response.data;
    },
    async getPortfolio(userId: number) {
        const response = await $api.get(`/wallet/${userId}`);
        return response.data;
    },
    async getTransactions(userId: number) {
        const response = await $api.get(`/wallet/${userId}/transactions`);
        return response.data;
    }
}

export const tradeAPI = {
    async buy(userId: number, currency: string, amount: number, currentPrice: number) {
        const response = await $api.post('/trade/buy', { userId, currency, amount, currentPrice });
        return response.data;
    },

    async sell(userId: number, currency: string, amount: number, currentPrice: number) {
        const response = await $api.post('/trade/sell', { userId, currency, amount, currentPrice });
        return response.data;
    },
};