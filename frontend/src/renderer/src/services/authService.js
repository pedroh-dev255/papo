// src/services/authService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import {getStorage} from "./storage";

export const authService = {
  async login(email, password, codigo) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, codigo }),
      });

      const data = await response.json();

      if (data.success !== true) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async logout() {
    const token = getStorage("token");
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success !== true) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

