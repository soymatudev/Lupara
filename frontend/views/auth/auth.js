import { AuthService } from '../shared/AuthService.js';
import { RouterViews } from '../shared/RouterViews.js';
import { Alerts } from '../shared/Alerts.js';

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    const useremail = document.getElementById('useremail').value;
    
    const userData = {
        useremail: useremail,
        password: password
    };

    try {
        const result = await AuthService.loginUser(userData);
        Alerts.showSuccess('¡Bienvenido!', `Has iniciado sesión como ${result.nombre || result.userId}.`, 1500);
        setTimeout(() => {
            RouterViews.home();
        }, 1500);
    } catch (error) {
        Alerts.showError('Fallo en el Login', error.message);
    }
});