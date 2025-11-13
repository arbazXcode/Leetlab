import axios from "axios";

// ✅ Create axios instance with default configuration
const axiosClient = axios.create({
    baseURL: "http://localhost:3000", // your backend server
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // needed if backend uses cookies or sessions
});

// ✅ Request Interceptor — runs before every request
axiosClient.interceptors.request.use(
    (config) => {
        // Public routes that should NOT send token
        const publicRoutes = ["/user/register", "/user/login"];

        // Only add token if the request is NOT for a public route
        if (!publicRoutes.includes(config.url)) {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config; // continue request
    },
    (error) => {
        console.error("❌ Request Error:", error.message);
        return Promise.reject(error);
    }
);

// ✅ Response Interceptor — runs after every response
axiosClient.interceptors.response.use(
    (response) => {
        // If backend sends back a token (like after login/signup), save it
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }

        return response;
    },
    (error) => {
        // Handle Unauthorized (401) globally
        if (error.response?.status === 401) {
            console.warn("⚠️ Unauthorized — clearing token and redirecting to login");

            // Clear tokens from local & session storage
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");

            // Redirect user to login if not already there
            const currentPath = window.location.pathname;
            if (
                !currentPath.includes("/login") &&
                !currentPath.includes("/signup")
            ) {
                window.location.href = "/login";
            }
        }

        // Handle other errors gracefully
        if (error.response?.status === 403) {
            console.warn("⚠️ Forbidden — user not allowed to access this resource");
        }

        if (error.response?.status === 404) {
            console.warn("⚠️ Not Found — invalid API endpoint:", error.config.url);
        }

        if (error.response?.status === 409) {
            console.warn("⚠️ Conflict — duplicate entry or already exists");
        }

        return Promise.reject(error);
    }
);

// ✅ Export the configured axios client
export default axiosClient;
