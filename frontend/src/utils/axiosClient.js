import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true, //cookies
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 second timeout
});

// Request interceptor - cookies are handled automatically with withCredentials: true
// No need to manually add Authorization header since backend uses cookies

// Add response interceptor for better error handling
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors
        if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
            error.message = 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
