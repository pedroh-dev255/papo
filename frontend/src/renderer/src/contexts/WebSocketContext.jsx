import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

const WebSocketContext = createContext(null);

const WS_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:3001";

export function WebSocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const intentionalCloseRef = useRef(false);

  const [connected, setConnected] = useState(false);

  /*
   * Fecha o WebSocket atual
   */
  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
  }, []);

  /*
   * Envia mensagem para o servidor
   */
  const send = useCallback((data) => {
    if (!wsRef.current) {
      console.warn("[WS] WebSocket não conectado");
      return false;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[WS] WebSocket não está aberto");
      return false;
    }

    wsRef.current.send(JSON.stringify(data));

    return true;
  }, []);

  /*
   * Conecta ao WebSocket
   */
  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    /*
     * Se já existe uma conexão aberta/conectando,
     * não cria outra.
     */
    if (
      wsRef.current &&
      (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      )
    ) {
      return;
    }

    intentionalCloseRef.current = false;

    console.log("[WS] Conectando...");

    const ws = new WebSocket(WS_URL);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Conectado");

      reconnectAttemptsRef.current = 0;
      setConnected(true);

      /*
       * Autentica a conexão.
       */
      ws.send(
        JSON.stringify({
          type: "auth",
          token,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("[WS] Mensagem recebida:", data);


        switch (data.type) {
          case "Error":
            toast.error(data.message);
            break;

          default:
            break;
        }

        /*
         * Aqui futuramente vamos tratar:
         *
         * message:new
         * message:update
         * message:delete
         * message:reaction
         * chat:update
         * call:incoming
         * notification
         */
      } catch (error) {
        console.error(
          "[WS] Erro ao processar mensagem:",
          error
        );
      }
    };

    ws.onerror = (error) => {
      console.error("[WS] Erro:", error);
    };

    ws.onclose = (event) => {
      console.log(
        `[WS] Conexão fechada. Code: ${event.code}`
      );

      setConnected(false);

      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      /*
       * Se foi logout/desmontagem do provider,
       * não tenta reconectar.
       */
      if (intentionalCloseRef.current) {
        return;
      }

      /*
       * Se perdeu a conexão, tenta novamente.
       *
       * Backoff:
       * 1s
       * 2s
       * 4s
       * 8s
       * ...
       * máximo 30s
       */
      const attempt = reconnectAttemptsRef.current++;

      const delay = Math.min(
        1000 * Math.pow(2, attempt),
        30000
      );

      console.log(
        `[WS] Reconectando em ${delay / 1000}s...`
      );

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [isAuthenticated, token]);

  /*
   * Conecta somente quando estiver autenticado.
   */
  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnect();
      return;
    }

    connect();

    /*
     * IMPORTANTE:
     * Ao desmontar o provider, fecha a conexão.
     */
    return () => {
      disconnect();
    };
  }, [
    isAuthenticated,
    token,
    connect,
    disconnect,
  ]);

  const value = {
    connected,
    send,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error(
      "useWebSocket deve ser utilizado dentro de WebSocketProvider"
    );
  }

  return context;
}
