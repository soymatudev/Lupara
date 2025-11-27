import { AuthService } from '../shared/AuthService.js'; // Ajusta la ruta según tu estructura final
import { Alerts } from '../shared/Alerts.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const useremail = document.getElementById('useremail').value;
    
    const userData = {
        useremail: useremail,
        password: password
    };

    try {
        const result = await AuthService.loginUser(userData);
        Alerts.showSuccess('¡Bienvenido!', `Has iniciado sesión como ${result.nombre || result.userId}.`);
        //window.location.href = '/views/health/index.html'; 
    } catch (error) {
        Alerts.showError('Fallo en el Login', error.message);
    }
});