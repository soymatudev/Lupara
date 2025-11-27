import { api } from './ApiClient.js';

export const ComponentesService = {

    getRoles: async () => {
        return api.get('/componentes/roles');
    },

}