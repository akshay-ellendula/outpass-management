import axios from 'axios';
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "https://outpass-management-backend.vercel.app/api"
export const axiosInstance = axios.create(
    {
        baseURL : BASE_URL,
        withCredentials :true 
    }
)