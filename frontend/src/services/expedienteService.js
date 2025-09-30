import api from './api';

export const expedienteService = {
  // Get all expedientes with pagination and filters
  getExpedientes: async (params = {}) => {
    const response = await api.get('/expedientes-simple', { params });
    return response.data;
  },

  // Get expediente by ID
  getExpedienteById: async (id) => {
    const response = await api.get(`/expedientes-simple/${id}`);
    return response.data;
  },

  // Create new expediente with file upload
  createExpediente: async (formData) => {
    const response = await api.post('/expedientes-simple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update expediente (only admin)
  updateExpediente: async (id, data) => {
    const response = await api.put(`/expedientes-simple/${id}`, data);
    return response.data;
  },

  // Delete expediente (only admin)
  deleteExpediente: async (id) => {
    const response = await api.delete(`/expedientes-simple/${id}`);
    return response.data;
  },

  // Download scanned file
  downloadFile: async (id) => {
    const response = await api.get(`/expedientes-simple/${id}/download-file`, {
      responseType: 'blob',
    });
    return response;
  },

  // Download PDF receipt
  downloadComprobante: async (id) => {
    const response = await api.get(`/expedientes-simple/${id}/download-comprobante`, {
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
