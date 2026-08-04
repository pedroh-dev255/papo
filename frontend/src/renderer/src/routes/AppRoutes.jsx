import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';
import Login from '../pages/login';
import Home from '../pages/Home';
import Contatos from '../pages/Contatos';
import Conversa from '../pages/Conversa';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <AuthGuard>
            <Home />
          </AuthGuard>
        }
      />
      <Route
        path="/contatos"
        element={
          <AuthGuard>
          <Contatos />
          </AuthGuard>
        }
      />
      <Route
        path="/conversa/:id"
        element={
          <AuthGuard>
          <Conversa />
          </AuthGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
