import axios from 'axios';

const Api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000, // 10 detik timeout
});

// ===========================================
// REQUEST INTERCEPTOR
// ===========================================
// Otomatis tambahkan token ke setiap request
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===========================================
// RESPONSE INTERCEPTOR
// ===========================================
// Handle error responses, terutama 401 Unauthorized
Api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika token expired atau invalid (401)
    if (error.response?.status === 401) {
      // Cek jika ini adalah login attempt, jangan redirect
      const isLoginAttempt = error.config?.url?.includes('/api/login');

      if (!isLoginAttempt) {
        // Hapus token yang invalid (hanya untuk non-login requests)
        localStorage.removeItem('auth_token');
        delete Api.defaults.headers.common['Authorization'];

        // Redirect ke login hanya jika user sudah login sebelumnya
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
      // Untuk login attempt, biarkan komponen handle error-nya
    }

    return Promise.reject(error);
  }
);

export default Api;
