import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const DEV_IP = debuggerHost?.split(':')[0];

const BASE_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api' 
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