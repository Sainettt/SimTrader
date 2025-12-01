
import axios from 'axios';

const API_URL = 'http://10.0.2.2:4000/api/auth'; 

const $api = axios.create({
    baseURL: API_URL,
});

export const authAPI = {
    async registration(userName: string, email: string, password: string) {
        const response = await $api.post('/registration', { userName, email, password });
        return response.data;
    },

    async login(email: string, password: string) {
        const response = await $api.post('/login', { email, password });
        return response.data;
    }
};