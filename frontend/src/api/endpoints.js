import api from './axiosConfig.js';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data), // Disabled on backend
  login: (data) => api.post('/auth/login', data), // Now accepts selectedRole
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

// Admin User Management APIs
export const adminAPI = {
  // User Management
  createUser: (data) => api.post('/admin/users/create', data),
  getUsers: (params) => api.get('/admin/users', { params }),
  getEmployers: () => api.get('/admin/employers'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

// TimeCard APIs
export const timeCardAPI = {
  // Employee routes
  submitHours: (data) => api.post('/timecards', data),
  getMyEntries: (params) => api.get('/timecards/my-entries', { params }),
  deleteEntry: (id) => api.delete(`/timecards/${id}`),
  
  // Employer routes
  getEmployerEntries: (params) => api.get('/timecards/employer/entries', { params }),
  getEmployees: () => api.get('/timecards/employer/employees'),
  getWeeklySummary: (startDate) => api.get('/timecards/employer/weekly-summary', { params: { startDate } })
};

// Client APIs (Admin only)
export const clientAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

// Hours APIs
export const hoursAPI = {
  getAll: (params) => api.get('/hours', { params }),
  getByDate: (date) => api.get(`/hours/${date}`),
  create: (data) => api.post('/hours', data),
  update: (id, data) => api.put(`/hours/${id}`, data),
  delete: (id) => api.delete(`/hours/${id}`)
};

// Reports APIs
export const reportsAPI = {
  getHoursSummary: (params) => api.get('/reports/hours-summary', { params }),
  getClientActivity: () => api.get('/reports/client-activity'),
  getWeeklySummary: () => api.get('/reports/my-weekly-summary'),
  getMonthlySummary: (params) => api.get('/reports/my-monthly-summary', { params })
};

// Client Logos APIs
export const clientLogosApi = {
  getAll: () => api.get('/client-logos'),
  getAllAdmin: () => api.get('/client-logos/all'),
  getById: (id) => api.get(`/client-logos/${id}`),
  create: (data) => api.post('/client-logos', data),
  update: (id, data) => api.put(`/client-logos/${id}`, data),
  delete: (id) => api.delete(`/client-logos/${id}`)
};

export const jobsApi = {
  // Public routes
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  
  // Admin routes
  getAllAdmin: () => api.get('/jobs/admin/all'),
  create: (data) => api.post('/jobs/admin/create', data),
  update: (id, data) => api.put(`/jobs/admin/${id}`, data),
  delete: (id) => api.delete(`/jobs/admin/${id}`),
  getApplications: (id) => api.get(`/jobs/admin/${id}/applications`),
  getAllApplications: () => api.get('/jobs/admin/applications/all'),
  updateApplicationStatus: (id, status) => api.put(`/jobs/admin/applications/${id}`, { status })
};
