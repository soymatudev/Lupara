import { AuthService } from "../AuthService";
import { RouterViews } from '../RouterViews.js';
import { Alerts } from "../Alerts";

export class HeaderComponent {
    static async loadHeader(containerId, headerPath = '/views/shared/components/header.html') {
        try {
            const response = await fetch(headerPath);
            const headerHtml = await response.text();
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = headerHtml;
                await this.initialize();
            }
        } catch (error) {
            console.error("Error loading header component:", error);
        }
    }

    static async initialize() {
        const isLoggedIn = await AuthService.isLoggedIn();
        const logoutButton = document.getElementById('logout-button');
        const loginButton = document.getElementById('login-button');
        const myReservation = document.getElementById('my-reservations-link');

        if (isLoggedIn.loggedIn) {
            if(logoutButton) logoutButton.classList.remove('hidden');
            if(loginButton) loginButton.classList.add('hidden');
            if(myReservation) myReservation.classList.remove('hidden');
        } else {
            if(logoutButton) logoutButton.classList.add('hidden');
            if(loginButton) loginButton.classList.remove('hidden');
            if(myReservation) myReservation.classList.add('hidden');
        }

        if (logoutButton) logoutButton.addEventListener('click', this.handleLogout);
        if (loginButton) loginButton.addEventListener('click', RouterViews.auth);
    }

    static async handleLogout() {
        try {
            await AuthService.logoutUser();
            window.location.href = '/views/auth/index.html';
        } catch (error) {
            Alerts.showError('Error de Logout', 'No se pudo cerrar la sesión.');
        }
    }
}