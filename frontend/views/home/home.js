import { EmpresaService } from '../shared/EmpresaService.js';
import { RouterViews } from '../shared/RouterViews.js';
import { AuthService } from '../shared/AuthService.js';
import { Alerts } from '../shared/Alerts.js';

const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results-container');
const searchButton = document.getElementById('search-button');
const logoLink = document.querySelector('.logo-link');
const logoutButton = document.getElementById('logout-button');

searchButton.addEventListener('click', () => handleSearch(searchInput.value, true));
logoutButton.addEventListener('click', () => logout());
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadFeaturedEstablishments();
    } , 1000);
});

const SearchService = {
    search: async (query) => {
        if (query.length < 3) return [];
         const response = await EmpresaService.getEmpresas();
        return response.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase().trim()) || 
            item.service.toLowerCase().includes(query.toLowerCase().trim())
        ).slice(0, 5);
    }
};

async function logout() {
    try {
        await AuthService.logoutUser();
        RouterViews.auth();
    } catch (error) {
        Alerts.showError('Error de Logout', 'No se pudo cerrar la sesión.');
    }
}

async function handleSearch(query, isButtonClick = false) {
    if (query.length < 3 && !isButtonClick) {
        searchResultsContainer.classList.add('hidden');
        return;
    }

    try {
        const results = await SearchService.search(query);
        
        if (results.length > 0) {
            renderResults(results);
            searchResultsContainer.classList.remove('hidden');
        } else {
            searchResultsContainer.classList.add('hidden');
        }

    } catch (error) {
        console.error('Error during search:', error);
        Alerts.showError('Error de Búsqueda', 'No se pudieron cargar los resultados.');
        searchResultsContainer.classList.add('hidden');
    }
}

function renderResults(results) {
    searchResultsContainer.innerHTML = '';
    
    results.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-3 cursor-pointer hover:bg-gray-100 transition duration-150';
        div.innerHTML = `
            <p class="font-medium">${item.name}</p>
            <p class="text-sm text-gray-500">${item.service}</p>
        `;
        div.addEventListener('click', () => {
            window.location.href = `/views/reserva/details.html?empresaId=${item.id}`;
        });
        searchResultsContainer.appendChild(div);
    });
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    RouterViews.home();
});

const galleryContainer = document.getElementById('establishment-gallery');

async function loadFeaturedEstablishments() {
    try {
        const featuredData = await EmpresaService.getFeaturedEstablishments();
        renderGallery(featuredData);
    } catch (error) {
        console.error('Error loading featured establishments:', error);
        Alerts.showError('Error de Carga', 'No se pudieron cargar los establecimientos destacados.');
    }
}

function renderGallery(items) {
    galleryContainer.innerHTML = ''; 
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden cursor-pointer';
        card.setAttribute('data-id', item.id);
        
        card.innerHTML = `
            <div class="h-40 bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                <img src="${item.imageurl || ''}" alt="${item.name}" class="w-full h-full object-cover">
            </div>
            <div class="p-4 text-left">
                <h3 class="text-xl font-semibold text-gray-900 truncate">${item.name}</h3>
                <p class="text-sm text-blue-600 mt-1">${item.service}</p>
                <p class="text-gray-500 text-sm mt-2">📍 ${item.location}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `/views/reserva/details.html?empresaId=${item.id}`;
        });
        
        galleryContainer.appendChild(card);
    });
}
