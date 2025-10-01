import api from './api';

const decretoService = {
  // Get all decretos with pagination and filters
  getDecretos: async (params = {}) => {
    try {
      const response = await api.get('/decretos', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get decreto by ID
  getDecretoById: async (id) => {
    try {
      const response = await api.get(`/decretos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new decreto
  createDecreto: async (decretoData) => {
    try {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(decretoData).forEach(key => {
        if (decretoData[key] !== null && decretoData[key] !== undefined) {
          formData.append(key, decretoData[key]);
        }
      });

      const response = await api.post('/decretos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update decreto
  updateDecreto: async (id, decretoData) => {
    try {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(decretoData).forEach(key => {
        if (decretoData[key] !== null && decretoData[key] !== undefined) {
          formData.append(key, decretoData[key]);
        }
      });

      const response = await api.put(`/decretos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete decreto
  deleteDecreto: async (id) => {
    try {
      const response = await api.delete(`/decretos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Download decreto file
  downloadDecretoFile: async (id) => {
    try {
      const response = await api.get(`/decretos/${id}/download-file`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get expedientes for linking
  getExpedientesForLink: async () => {
    try {
      const response = await api.get('/decretos/expedientes-for-link');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Helper function to download file
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default decretoService;
