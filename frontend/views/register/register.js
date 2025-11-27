import { AuthService } from '../shared/AuthService.js'; 
import { Alerts } from '../shared/Alerts.js';         

async function loadRoles() {
    // Aquí iría una llamada a AuthService.getRoles()
    // Por ahora, solo simula que el select ya tiene las opciones del HTML.
    console.log("Roles cargados. Pendiente implementar la llamada a la API para obtener roles.");
}

document.addEventListener('DOMContentLoaded', loadRoles);

document.getElementById('userRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // 1. Recopilar todos los datos
    const userData = {
        id_rol: parseInt(document.getElementById('id_rol').value), // Convertir a número (importante para la DB)
        nombre: document.getElementById('nombre').value,
        apellidoPaterno: document.getElementById('apellido_paterno').value,
        apellidoMaterno: document.getElementById('apellido_materno').value,
        correo: document.getElementById('correo').value,
        password: document.getElementById('password').value
    };

    try {
        // 2. Llamar al servicio de registro (registerUser)
        const result = await AuthService.registerUser(userData);
        
        Alerts.showSuccess('¡Registro Exitoso!', `Bienvenido ${result.nombreCompleto}. Tu cuenta ha sido creada.`);
        window.location.href = '/views/auth/index.html'; 
    } catch (error) {
        Alerts.showError('Fallo al Registrar', error.message);
        console.error('Error de registro:', error);
    }
});