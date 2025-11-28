import { AuthService } from '../shared/AuthService.js'; 
import { RouterViews } from '../shared/RouterViews.js';
import { ComponentesService } from '../shared/ComponentesService.js';
import { Alerts } from '../shared/Alerts.js';         

async function loadRoles() {
    const result = await ComponentesService.getRoles();
    const rolesSelect = document.getElementById('id_rol');
    result.roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.nombre_rol;
        rolesSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', loadRoles);

document.getElementById('userRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const userData = {
        id_rol: parseInt(document.getElementById('id_rol').value),
        nombre: document.getElementById('nombre').value,
        apellido_paterno: document.getElementById('apellido_paterno').value,
        apellido_materno: document.getElementById('apellido_materno').value,
        useremail: document.getElementById('correo').value,
        password: document.getElementById('password').value
    };

    try {
        const result = await AuthService.registerUser(userData);
        Alerts.showSuccess('¡Registro Exitoso!', `Bienvenido ${result.nombre}. Tu cuenta ha sido creada.`);
        setTimeout(() => {
            RouterViews.auth();
        }, 3200);
    } catch (error) {
        Alerts.showError('Fallo al Registrar', error.message);
        console.error('Error de registro:', error);
    }
});