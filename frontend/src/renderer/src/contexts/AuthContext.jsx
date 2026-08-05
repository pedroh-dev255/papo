// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { saveStorage, removeStorage, getStorage } from "../services/storage";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const user = getStorage("userData");
    const token = getStorage("token");

    if(user && token){
        setUser(user);
        setToken(token);
    }
    setLoading(false);
  },[]);


  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      if (token) {
        try {
           const response = await fetch(`${API_URL}/auth/validate`, {
             headers: { Authorization: `Bearer ${token}` }
           });
           if (!response.ok) {
             logout();
           }
           setIsAuthenticated(true);
        } catch (error) {
          setIsAuthenticated(false);
          console.error('Erro ao validar token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [token]);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);

    setIsAuthenticated(true);
    saveStorage("userData", userData);
    saveStorage("token", tokenData);
  };

  const logout = async () => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);

      removeStorage("userData");
      removeStorage("token");
    } catch (error) {
      throw new Error(error.message);
    }

  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
