import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor for clean error logs
client.interceptors.response.use(
  (response) => {
    console.log(`[API 200] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      status: error.response?.status,
      detail: error.response?.data?.detail || error.message,
    });
    return Promise.reject(error);
  }
);

export default client;