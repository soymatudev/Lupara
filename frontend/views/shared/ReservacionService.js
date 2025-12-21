import { api } from "./ApiClient";

export const ReservacionService = {
    createReservacion: async (reservacionData) => {
        return api.post('/reservaciones', reservacionData);
    },

    getReservacionById: async (reservacionId) => {
        return api.get(`/reservaciones/${reservacionId}`);
    },

    getUserReservaciones: async (userId) => {
        return api.get(`/reservaciones/mis-reservas`);
    },

    updateReservacion: async (reservacionId, reservacionData) => {
        return api.put(`/reservaciones/${reservacionId}`, reservacionData);
    },

    cancelReservacion: async (reservacionId) => {
        return api.delete(`/reservaciones/${reservacionId}`);
    }
}