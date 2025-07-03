// src/services/api.ts
const API_BASE_URL = 'https://eventsminiappbackend-production.up.railway.app'; // Replace with your Railway URL

interface ApiResponse {
    message: string;
    status: string;
    timestamp?: string;
    service?: string;
}

interface EventsResponse {
    events: Array<{
        id: number;
        title: string;
        image: string;
        category: string;
        location: [number, number];
        description: string;
    }>;
    total: number;
    status: string;
}

class ApiService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const defaultOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            console.log(`Making API request to: ${url}`);

            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async healthCheck(): Promise<ApiResponse> {
        return this.request('/');
    }

    async getMessage(): Promise<ApiResponse> {
        return this.request('/api/message');
    }

    async getEvents(): Promise<EventsResponse> {
        return this.request('/api/events');
    }
}

export const apiService = new ApiService();