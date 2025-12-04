import { api } from "./ApiClient";

export const EmpresaService = {
    getEmpresas: async () => {
        return api.get('/empresas');
    },

    getEmpresaById: async (empresaId) => {
        return api.get(`/empresas/${empresaId}`);
    },

    createEmpresa: async (empresaData) => {
        return api.post('/empresas', empresaData);
    },

    updateEmpresa: async (empresaId, empresaData) => {
        return api.put(`/empresas/${empresaId}`, empresaData);
    },

    deleteEmpresa: async (empresaId) => {
        return api.delete(`/empresas/${empresaId}`);
    },

    getFeaturedEstablishments: async () => {
        return api.get('/empresas/destacadas');
    }
}
