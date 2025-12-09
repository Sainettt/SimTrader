
import axios from 'axios';

const API_URL = 'http://10.0.2.2:4000/api'; 

const $api = axios.create({
    baseURL: API_URL,
});

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
    }
}
