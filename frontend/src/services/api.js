import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL del backend
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          break;
        case 403:
          toast.error('No tienes permisos para realizar esta acción.');
          break;
        case 404:
          toast.error(data.message || 'Recurso no encontrado.');
          break;
        case 422:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.msg));
          } else {
            toast.error(data.message || 'Error de validación.');
          }
          break;
        case 429:
          toast.error('Demasiadas solicitudes. Intenta de nuevo más tarde.');
          break;
        case 500:
          toast.error('Error interno del servidor. Intenta de nuevo más tarde.');
          break;
        default:
          toast.error(data.message || 'Ha ocurrido un error inesperado.');
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Tiempo de espera agotado. Verifica tu conexión a internet.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Error de red. Verifica tu conexión a internet.');
    } else {
      toast.error('Ha ocurrido un error inesperado.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
