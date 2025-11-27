import Swal from 'sweetalert2'; 
export const Alerts = {
    
    showSuccess: (title, text) => {
        Swal.fire({
            icon: 'success',
            title: title || 'Operación Exitosa',
            text: text || 'La acción se completó correctamente.',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    },

    showError: (title, text) => {
        Swal.fire({
            icon: 'error',
            title: title || 'Error',
            text: text || 'Ha ocurrido un error inesperado.',
            footer: 'Intenta nuevamente o contacta a soporte.',
        });
    },

    confirmAction: (title, text) => {
        return Swal.fire({
            title: title || '¿Estás seguro?',
            text: text || "No podrás revertir esta acción.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });
    }
};