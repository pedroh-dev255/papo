const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL   || 'ws://localhost:3000';


export const chatService = {

  async getInitialChats (token) {

    try {
      const response = await fetch(`${API_URL}/chats/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (!data || data.success !== true) {
        throw new Error(data.message || 'Chats não encontrados');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Erro ao consultar chats');
    }
  }
}
