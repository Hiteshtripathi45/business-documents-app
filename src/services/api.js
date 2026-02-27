import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Invoice APIs
export const invoiceAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  sendEmail: (id, emailData) => api.post(`/invoices/${id}/send`, emailData),
};

// Quotation APIs
export const quotationAPI = {
  getAll: () => api.get('/quotations'),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  delete: (id) => api.delete(`/quotations/${id}`),
  convertToInvoice: (id) => api.post(`/quotations/${id}/convert-to-invoice`),
};

// Project Order APIs
export const projectOrderAPI = {
  getAll: () => api.get('/project-orders'),
  getById: (id) => api.get(`/project-orders/${id}`),
  create: (data) => api.post('/project-orders', data),
  update: (id, data) => api.put(`/project-orders/${id}`, data),
  delete: (id) => api.delete(`/project-orders/${id}`),
  updateStatus: (id, status) => api.patch(`/project-orders/${id}/status`, { status }),
};

// E-Challan APIs
export const echallanAPI = {
  getAll: () => api.get('/echallans'),
  getById: (id) => api.get(`/echallans/${id}`),
  create: (data) => api.post('/echallans', data),
  update: (id, data) => api.put(`/echallans/${id}`, data),
  delete: (id) => api.delete(`/echallans/${id}`),
  updateDeliveryStatus: (id, status) => api.patch(`/echallans/${id}/delivery`, { status }),
};

// Proforma Invoice APIs
export const proformaAPI = {
  getAll: () => api.get('/proforma-invoices'),
  getById: (id) => api.get(`/proforma-invoices/${id}`),
  create: (data) => api.post('/proforma-invoices', data),
  update: (id, data) => api.put(`/proforma-invoices/${id}`, data),
  delete: (id) => api.delete(`/proforma-invoices/${id}`),
  convertToInvoice: (id) => api.post(`/proforma-invoices/${id}/convert-to-invoice`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getMonthlyData: () => api.get('/dashboard/monthly-data'),
};

export default api;