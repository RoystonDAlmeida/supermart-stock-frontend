
import axios from 'axios';
import { Product } from '@/contexts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor for authentication
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

// Add response interceptor to handle permission errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      // Handle permission errors more gracefully
      console.error('Permission denied:', error.response.data.message);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerUser = async (userData: { username: string, email: string, password: string, role?: string }) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const loginUser = async (credentials: { username: string, password: string }) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Product APIs
export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const addProduct = async (product: Omit<Product, "id" | "lastUpdated" | "salesCount" | "status">) => {
  const response = await api.post('/products', {
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    description: product.description
  });
  return response.data;
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Stock APIs
export const getStockSummary = async () => {
  const response = await api.get('/stock');
  return response.data;
};

export const recordSale = async (productId: string, quantity: number) => {
  try {
    console.log('Recording sale:', { productId, quantity });
    const response = await api.post('/sales', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error recording sale:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
    throw error;
  }
};

export const getSalesHistory = async () => {
  const response = await api.get('/sales');
  return response.data;
};

export default api;
