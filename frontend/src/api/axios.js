import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the token to the header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        const isAuthRoute = config.url.includes('login') || config.url.includes('register');
        if (token && !isAuthRoute) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log("Token expired or unauthorized, logging out...");
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            // Optional: window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
