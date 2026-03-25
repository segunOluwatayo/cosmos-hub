import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor – unwrap data, extract error message 
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// APOD 
export const apodApi = {
  getToday:  ()                   => api.get('/apod'),
  getByDate: (date)               => api.get('/apod', { params: { date } }),
  getRange:  (start_date, end_date) => api.get('/apod', { params: { start_date, end_date } }),
};

// Asteroids (NeoWs)
export const asteroidsApi = {
  getFeed: (start_date, end_date) =>
    api.get('/asteroids', { params: { start_date, end_date } }),
};

// Mars Rover Photos 
export const marsApi = {
  getPhotos: (params) => api.get('/mars/photos', { params }),
  getRovers: ()       => api.get('/mars/rovers'),
};

// EPIC (Earth Imagery) 
export const epicApi = {
  getLatest:  ()     => api.get('/epic'),
  getByDate:  (date) => api.get('/epic', { params: { date } }),
  getDates:   ()     => api.get('/epic/dates'),
};

export default api;

// AI Analysis
export const aiApi = {
  analyzeApod:        (payload) => api.post('/ai/apod',              payload),
  asteroidBriefing:   (payload) => api.post('/ai/asteroid-briefing', payload),
  describeMarsScene:  (payload) => api.post('/ai/mars-scene',        payload),
};