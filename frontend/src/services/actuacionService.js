import api from './api';

export const actuacionService = {
  // Get all actuaciones with pagination and filters
  getActuaciones: async (params = {}) => {
    const response = await api.get('/actuaciones', { params });
    return response.data;
  },

  // Get actuacion by ID
  getActuacionById: async (id) => {
    const response = await api.get(`/actuaciones/${id}`);
    return response.data;
  },

  // Create new actuacion with file upload
  createActuacion: async (formData) => {
    const response = await api.post('/actuaciones', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download PDF receipt
  downloadComprobante: async (id) => {
    const response = await api.get(`/actuaciones/${id}/download-comprobante`, {
      responseType: 'blob',
    });
    return response;
  },

  // Helper function to download file
  downloadFileHelper: (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
