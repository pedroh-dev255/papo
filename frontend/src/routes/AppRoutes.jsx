import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Chat from "../pages/Chat";
import NotFound from "../pages/NotFound";
import AuthGuard from "../components/AuthGuard";
import MainLayout from "../layouts/MainLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotas protegidas com layout compartilhado */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <MainLayout>
              <Home />
            </MainLayout>
          </AuthGuard>
        }
      />
      
      <Route
        path="/chat/:id?"
        element={
          <AuthGuard>
            <MainLayout>
              <Chat />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Rota de contatos (exemplo) */}
      <Route
        path="/contacts"
        element={
          <AuthGuard>
            <MainLayout>
              <Home />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Rota de canais (exemplo) */}
      <Route
        path="/channels"
        element={
          <AuthGuard>
            <MainLayout>
              <Home />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Rota de perfil (exemplo) */}
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <MainLayout>
              <Home />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Rota de configurações (exemplo) */}
      <Route
        path="/settings"
        element={
          <AuthGuard>
            <MainLayout>
              <Home />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Rota de notificações (exemplo) */}
      <Route
        path="/notifications"
        element={
          <AuthGuard>
            <MainLayout>
              <Home />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Página 404 - Deve ser a última rota */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}