import axios from "axios";

export const backendURL = import.meta.env.VITE_ENV === 'local'
    ? 'http://localhost:3001/api'
    : import.meta.env.VITE_BACKEND_URL;


export const axiosInstance = axios.create({
    baseURL: backendURL,
    withCredentials: true,
});