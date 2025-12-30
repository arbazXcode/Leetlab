import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true, //cookies
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 second timeout
});

export default axiosClient;
