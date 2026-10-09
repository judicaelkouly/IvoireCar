import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier la session active auprès du serveur
  const checkAuth = async () => {
    try {
      const response = await api.get('/api/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Exécution unique au chargement de l'application
  useEffect(() => {
    checkAuth();
  }, []);

  // Obtenir le cookie CSRF
  const getCsrfToken = async () => {
    await api.get('/sanctum/csrf-cookie');
  };

  // Connexion
  const login = async (credentials) => {
    // 1. Initialiser le cookie CSRF
    await getCsrfToken();

    // 2. Authentifier l'utilisateur
    const response = await api.post('/api/login', credentials);

    // 3. Valider la session créée auprès de /api/me pour s'assurer que le cookie passe bien
    const currentUser = await checkAuth();

    return response.data;
  };

  // Inscription
  const register = async (formData) => {
    await getCsrfToken();
    const response = await api.post('/api/register', formData);
    await checkAuth();
    return response.data;
  };

  // Déconnexion
  const logout = async () => {
    try {
      await api.post('/api/logout');
    } catch (e) {
      // Ignorer si la session est déjà expirée
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
