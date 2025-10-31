import api from './api.js';

export const login = async (credentials) => {
  const { data } = await api.post('/login', credentials);
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post('/register', payload);
  return data;
};

export const logout = () => {
  return Promise.resolve();
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/me');
  return data;
};
