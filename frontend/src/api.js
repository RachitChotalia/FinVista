import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Helper to get token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- AUTH ---
export const loginUser = async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data.access_token) localStorage.setItem('token', response.data.access_token);
    return response.data;
};

export const registerUser = async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    if (response.data.access_token) localStorage.setItem('token', response.data.access_token);
    return response.data;
};

// --- USER DATA ---
export const fetchUserProfile = async () => {
    try {
        const response = await api.get('/users/me', { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Profile Fetch Error", error);
        throw error;
    }
};

// --- SIMULATION ---
export const runSimulation = async (simulationData) => {
    try {
        // simulationData = { current_age, retirement_age, monthly_savings, ... }
        const response = await api.post('/project', simulationData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Simulation Error", error);
        throw error;
    }
};

export const fetchAIInsights = async (data) => {
    try {
        const response = await api.post('/analyze', data, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        return null; // Fail silently for UI
    }
};