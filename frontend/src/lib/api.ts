import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('access_token', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  getNonce: (address: string) => api.post('/auth/nonce', { address }),
  verifySignature: (address: string, signature: string) =>
    api.post('/auth/verify', { address, signature }),
};

export const nftApi = {
  getAll: (params?: any) => api.get('/nfts', { params }),
  getById: (id: string) => api.get(`/nfts/${id}`),
  create: (data: any) => api.post('/nfts', data),
  update: (id: string, data: any) => api.put(`/nfts/${id}`, data),
  getPriceHistory: (id: string) => api.get(`/nfts/${id}/price-history`),
  addToFavorites: (id: string) => api.post(`/nfts/${id}/favorite`),
  removeFromFavorites: (id: string) => api.delete(`/nfts/${id}/favorite`),
};

export const collectionApi = {
  getAll: (params?: any) => api.get('/collections', { params }),
  getById: (id: string) => api.get(`/collections/${id}`),
  create: (data: any) => api.post('/collections', data),
  update: (id: string, data: any) => api.put(`/collections/${id}`, data),
};

export const orderApi = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
};

export const ipfsApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ipfs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadJson: (data: any) => api.post('/ipfs/upload-json', data),
};

export default api;
