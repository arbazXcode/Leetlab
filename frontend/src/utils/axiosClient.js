import axios from 'axios';

// Create axios instance with base configuration
const axiosClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for sending cookies
});

// Request interceptor to add token to requests
axiosClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage or sessionStorage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle tokens and errors
axiosClient.interceptors.response.use(
    (response) => {
        // If the response contains a token, save it
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }

        return response;
    },
    (error) => {
        // Handle 401 errors globally
        if (error.response?.status === 401) {
            // Clear token if unauthorized
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');

            // Only redirect to login if not already on auth pages
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;