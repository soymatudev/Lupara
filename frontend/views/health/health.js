import { AuthService } from '../shared/AuthService.js';

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
        console.log('Registro de usuario exitoso:', result);
        //window.location.href = '/views/health/index.html'; 
        // Redirigir a la página principal después del registro
    } catch (error) {
        alert('Fallo de Registro: ' + error.message);
    }
});