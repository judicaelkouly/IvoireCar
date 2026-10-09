import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Note : Pointer sur la racine du domaine pour le cookie CSRF
  withCredentials: true, 
  withXSRFToken: true,           
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour intercepter les erreurs de session expirée (401 / 419)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 419].includes(error.response.status)) {
     // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
