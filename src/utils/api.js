import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (userData) => api.post('/auth/login', userData);

// Board APIs
export const createBoard = (boardData) => api.post('/boards/create', boardData);
export const getUserBoards = (userId) => api.get(`/boards/user/${userId}`);
export const getBoard = (boardId) => api.get(`/boards/${boardId}`);
export const updateBoard = (boardId, boardData) => api.put(`/boards/${boardId}`, boardData);
export const deleteBoard = (boardId) => api.delete(`/boards/${boardId}`);

// Image search API
export const searchImages = (query) => api.get(`/images/search?query=${query}`);

export default api;