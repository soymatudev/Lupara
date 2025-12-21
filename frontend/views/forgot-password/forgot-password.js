import { Alerts } from '../shared/Alerts.js'; 
import { AuthService } from '../shared/AuthService.js';
import { RouterViews } from '../shared/RouterViews.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        document.getElementById('forgotPasswordForm').classList.add('hidden');
        document.getElementById('reset-password-section').classList.remove('hidden');
    }

    const resetForm = document.getElementById('reset-form');
    resetForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            return Alerts.showError('Error', 'Las contraseñas no coinciden.');
        }

        try {
            const result = await AuthService.resetPassword(token, newPassword);
            Alerts.showSuccess('¡Éxito!', 'Tu contraseña ha sido actualizada.');
            setTimeout(() => window.location.href = '../auth/index.html', 2000);
        } catch (error) {
            Alerts.showError('Error', error.response?.data?.message || 'Token inválido o expirado.');
        }
    });
})

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