import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['api-key'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export API service functions
export const apiService = {
  // Client endpoints
  async getClients() {
    return api.get('/api/clients/');
  },
  
  async getClient(id) {
    return api.get(`/api/clients/${id}`);
  },
  
  async createClient(data) {
    return api.post('/api/clients/', data);
  },
  
  async updateClient(id, data) {
    return api.put(`/api/clients/${id}`, data);
  },
  
  async deleteClient(id) {
    return api.delete(`/api/clients/${id}`);
  },
  
  // Document endpoints
  async getDocuments() {
    return api.get('/api/documents/');
  },
  
  async getDocument(id) {
    return api.get(`/api/documents/${id}`);
  },
  
  async createDocument(data) {
    return api.post('/api/documents/', data);
  },
  
  async updateDocument(id, data) {
    return api.put(`/api/documents/${id}`, data);
  },
  
  async deleteDocument(id) {
    return api.delete(`/api/documents/${id}`);
  },
  
  // Analytics endpoints
  async getAnalyticsSummary(days = 30) {
    return api.get(`/api/analytics/summary?days=${days}`);
  },
  
  async getDailySessions(days = 30) {
    return api.get(`/api/analytics/sessions/daily?days=${days}`);
  },
  
  async getDailyMessages(days = 30) {
    return api.get(`/api/analytics/messages/daily?days=${days}`);
  },
};

export default api;
