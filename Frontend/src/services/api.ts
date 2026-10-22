import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage'; // Import nowego adaptera

const DEV_IP = '192.168.0.213'; // Podmień na swoje IP z ipconfig dla telefonu

const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8000/api' 
  : `http://${DEV_IP}:8000/api`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(
  async (config) => {
    // Bezpieczny odczyt działający zarówno w Webie, jak i na telefonie
    const token = await storage.getItem('userToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);