import { AuthService } from '../shared/AuthService.js';
import { RouterViews } from '../shared/RouterViews.js';
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
        setTimeout(() => {
            RouterViews.home();
        }, 3000);
    } catch (error) {
        Alerts.showError('Fallo en el Login', error.message);
    }
});