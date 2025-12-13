import { api } from './ApiClient.js';

export const AuthService = {

    loginUser: async (userData) => {
        return api.post('/auth/login', userData);
    },

    registerUser: async (userData) => {
        return api.post('/auth/register', userData);
    },

    logoutUser: async () => {
        return api.post('/auth/logout');
    },

    isLoggedIn: async () => {
        return api.get('/auth/status');
    }

};