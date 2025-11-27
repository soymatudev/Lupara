import { api } from '../shared/ApiClient.js';
import { Alerts } from '../shared/Alerts.js'; 

const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results-container');
const searchButton = document.getElementById('search-button');
const logoLink = document.querySelector('.logo-link');

const SearchService = {
    search: async (query) => {
        if (query.length < 3) return [];
        // const response = await api.get(`/search/empresas?query=${query}`);
        // return response.data;
        
        // Simulación de datos para prueba
        const simulatedData = [
            { id: 1, name: "Cafetería El Sol", service: "Alimentos" },
            { id: 2, name: "Gimnasio Fit Zone", service: "Deporte" },
            { id: 3, name: "Spa Relájate", service: "Bienestar" },
        ];
        return simulatedData.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) || 
            item.service.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }
};

searchInput.addEventListener('input', debounce(handleSearch, 300));
searchButton.addEventListener('click', () => handleSearch(searchInput.value, true));

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
    window.location.href = '/views/empresa/index.html'; 
});