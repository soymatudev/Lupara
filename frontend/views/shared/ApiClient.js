
class ApiClient {

    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        return handleErrors(response);
    }

    async get(endpoint) {
        const response = await this.request(endpoint, { method: 'GET' });
        return response.json();
    }

    async post(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        })
        return response.json();
    }

    async delete(endpoint) {
        const response = await this.request(endpoint, { method: 'DELETE' });
        return response.status === 204 ? { success: true } : response.json();
    }

    async put(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.json();
    }

}

const handleErrors = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
            console.error('Unauthorized access - redirecting to login.');
            window.location.href = '/views/auth/index.html';
            //throw new Error('Unauthorized: Please log in to continue.');
        }

        const message = errorData.message || `Error: ${response.status} ${response.statusText}`;
        throw new Error(message);
    }
    return response;
};

export const api = new ApiClient();