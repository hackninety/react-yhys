import axios from 'axios';

// Base URL for the API
// In production (R2), this should point to your backend server URL.
// For now, we assume relative path or configure via ENV.
// Since Frontend is on R2 (different domain) and Backend is on EC2/Server, 
// we need the backend URL. 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Check if backend is healthy
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        await apiClient.get('/api/health');
        return true;
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
};
