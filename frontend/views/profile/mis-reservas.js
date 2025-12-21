import { HeaderComponent } from "../shared/components/HeaderComponent.js";
import { ReservacionService } from "../shared/ReservacionService.js";
import { Alerts } from "../shared/Alerts.js";
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        HeaderComponent.loadHeader("main-header");
        loadReservations();
    }, 1000);
});

async function loadReservations() {
    try {
        const container = document.getElementById("reservations-container");
        const noReservationsMessage = document.getElementById("no-reservations");
        const reservations = await ReservacionService.getUserReservaciones();
        if (!reservations || reservations.length === 0) {
            container.innerHTML = "";
            noReservationsMessage.classList.remove("hidden");
            return [];
        }
        noReservationsMessage.classList.add("hidden");
        renderReservations(reservations);
        return reservations;
    } catch (error) {
        Alerts.showError("Error","No se pudieron cargar las reservas del usuario.", 3000);
    }
}

function renderReservations(reservations) {
    const container = document.getElementById('reservations-container');
    container.innerHTML = '';

    reservations.forEach(res => {
        const dateObj = dayjs(res.fecha_hora_inicio);
        const fechaFormateada = dateObj.format('dddd, D [de] MMMM'); // Ej: lunes, 25 de diciembre
        const horaFormateada = dateObj.format('HH:mm [hs]');
        
        const statusColors = setStatusColor();
        const statusClass = statusColors[res.estado] || 'bg-gray-100 text-gray-700';
        const isCancelable = dateObj.isAfter(dayjs()) && res.estado !== 'Cancelada';

        const card = `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col hover:shadow-2xl transition-shadow duration-300">
                <div class="relative h-32 bg-gray-200">
                    <img src="${res.url_foto || '/assets/images/placeholder.jpg'}" 
                         class="w-full h-full object-cover" 
                         alt="${res.nombre_negocio}">
                    <div class="absolute top-3 right-3">
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusClass}">
                            ${res.estado}
                        </span>
                    </div>
                </div>
                
                <div class="p-5 flex-1">
                    <h3 class="font-bold text-lg text-gray-800 mb-1">${res.nombre_negocio}</h3>
                    <div class="space-y-2 text-sm text-gray-600">
                        <div class="flex items-center capitalize">
                            <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span>${fechaFormateada}</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>${horaFormateada}</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>${res.cantidad_pax} personas</span>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-gray-50 border-t border-gray-100">
                    ${isCancelable ? `
                        <button onclick="window.cancelReservation(${res.id})" 
                                class="w-full py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition duration-200">
                            Cancelar Reserva
                        </button>
                    ` : `
                        <p class="text-center text-gray-400 text-xs italic py-2">No disponible para cancelar</p>
                    `}
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

window.cancelReservation = async (id) => {
    const confirm = await Alerts.showConfirm('¿Estás seguro?', 'Esta acción no se puede deshacer.');
    if (confirm) {
        try {
            await ReservacionService.cancelReservacion(id);
            Alerts.showSuccess('Cancelada', 'Tu reserva ha sido cancelada.');
            loadReservations();
        } catch (error) {
            const msg = error.response?.data?.message || 'No se pudo cancelar la reserva.';
            Alerts.showError('Error', msg);
        }
    }
};

function setStatusColor () {
    return {
        'Pendiente': 'bg-yellow-100 text-yellow-700',
        'Confirmada': 'bg-green-100 text-green-700',
        'Cancelada': 'bg-red-100 text-red-700',
        'Completada': 'bg-blue-100 text-blue-700'
    };
}