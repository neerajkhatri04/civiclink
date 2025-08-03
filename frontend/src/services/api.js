import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const submitReport = async (formData) => {
  try {
    const response = await api.post('/reports/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to submit report'
    );
  }
};

export const getReportStatus = async (reportId) => {
  try {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to get report status'
    );
  }
};

export const getDepartments = async () => {
  try {
    const response = await api.get('/departments');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to get departments'
    );
  }
};

export const getStatesFromAPI = async () => {
  try {
    const response = await api.get('/states-zones/states');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to get states'
    );
  }
};

export const getZonesFromAPI = async (state) => {
  try {
    const response = await api.get(`/states-zones/zones/${state}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to get zones'
    );
  }
};

export const getStateZoneMapping = async () => {
  try {
    const response = await api.get('/states-zones');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to get state-zone mapping'
    );
  }
};

export const getUserReports = async (userId) => {
  try {
    const response = await api.get(`/reports/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to get user reports'
    );
  }
};

export default api;
