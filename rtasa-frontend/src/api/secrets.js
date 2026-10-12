// src/api/secrets.js
import client from './client';

export const checkHealth = async () => {
  try {
    const res = await client.get('/health');
    return res.data.status === 'healthy';
  } catch {
    return false;
  }
};

export const storeSecret = async (formData) => {
  const response = await client.post('/api/v1/secrets/store', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const reconstructSecret = async (payload) => {
  // Handle both FormData (image upload) and standard JSON payloads
  const isFormData = payload instanceof FormData;
  const response = await client.post('/api/v1/secrets/reconstruct', payload, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  });
  return response.data;
};

export const getShareImageUrl = (shareId) => {
  return `${client.defaults.baseURL}/api/v1/secrets/shares/${shareId}/image`;
};