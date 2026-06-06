// ============================================
// api.js — Axios Base Configuration
// ============================================
// This file creates a pre-configured axios instance.
// Instead of writing the full URL every time, we can just use:
//   api.get('/auth/login')   instead of   axios.get('http://localhost:5000/api/auth/login')
//
// It also automatically attaches the JWT token to every request.

import axios from 'axios';

// Create an axios instance with the backend base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // all requests go to this base URL
});

// ---------- REQUEST INTERCEPTOR ----------
// This runs BEFORE every request is sent
// It automatically adds the JWT token from localStorage to the headers
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

// ---------- RESPONSE INTERCEPTOR ----------
// This runs AFTER every response is received
// If we get a 401 (unauthorized), the token is expired — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
