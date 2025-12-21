import { Alerts } from '../shared/Alerts.js'; 
import { AuthService } from '../shared/AuthService.js';
import { RouterViews } from '../shared/RouterViews.js';
import { api } from '../shared/ApiClient.js'; // Necesitas el cliente base

document.getElementById('forgotPasswordForm').addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const email = document.getElementById('email').value;

    try {
        await AuthService.forgotPassword(email);
        
        Alerts.showSuccess(
            '¡Correo Enviado!', 
            'Si tu cuenta existe, recibirás un enlace de recuperación en tu bandeja de entrada.'
        );
        document.getElementById('forgotPasswordForm').reset();

    } catch (error) {
        Alerts.showError('Error', 'Hubo un problema al procesar la solicitud. Intenta más tarde.');
        console.error('Error al solicitar reinicio:', error);
    }
});