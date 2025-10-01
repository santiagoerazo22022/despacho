import axios from 'axios';
import { toast } from 'react-toastify';

// Función para detectar la URL base del backend automáticamente
const getBaseURL = () => {
  // Si hay una variable de entorno definida, usarla
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Detectar si estamos accediendo desde red local
  const currentHost = window.location.hostname;
  
  // Si estamos en localhost o 127.0.0.1, usar localhost para el backend
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  
  // Si estamos en una IP de red local, usar la misma IP para el backend
  if (currentHost.match(/^192\.168\.\d+\.\d+$/)) {
    return `http://${currentHost}:3000/api`;
  }
  
  // Si estamos en una IP de red local (10.x.x.x), usar la misma IP para el backend
  if (currentHost.match(/^10\.\d+\.\d+\.\d+$/)) {
    return `http://${currentHost}:3000/api`;
  }
  
  // Si estamos en una IP de red local (172.16-31.x.x), usar la misma IP para el backend
  if (currentHost.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/)) {
    return `http://${currentHost}:3000/api`;
  }
  
  // Por defecto, usar localhost
  return 'http://localhost:3000/api';
};

// Base URL del backend
const BASE_URL = getBaseURL();

// Log para debugging
console.log('🌐 Frontend URL:', window.location.origin);
console.log('🔗 Backend URL:', BASE_URL);

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
