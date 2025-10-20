import axios from 'axios';

const API_BASE_URL = 'https://f.a2a.ing';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data, 
  (error) => Promise.reject(error)
);

export default api;
