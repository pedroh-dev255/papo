import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Stack,
} from '@mui/material'

import NavBar from '../components/navbar'

export default function Home() {
  const { user, logout } = useAuth()
  const { addNotification } = useNotification()

  const handleNotificationInfo = () => {
    addNotification({
      type: 'info',
      title: 'Informação',
      body: 'Esta é uma notificação de informação.',
      duration: 5000,
    })
  }

  const handleNotificationSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Sucesso!',
      body: 'A operação foi concluída com sucesso.',
      duration: 5000,
    })
  }

  const handleNotificationWarning = () => {
    addNotification({
      type: 'warning',
      title: 'Aviso',
      body: 'Cuidado! Verifique sua ação antes de continuar.',
      duration: 5000,
    })
  }

  const handleNotificationError = () => {
    addNotification({
      type: 'error',
      title: 'Erro',
      body: 'Ocorreu um erro ao processar sua solicitação.',
      duration: 5000,
    })
  }

  const handleNotificationWithAction = () => {
    addNotification({
      type: 'info',
      title: 'Nova Mensagem',
      body: 'Você recebeu uma nova mensagem de João Silva',
      action: {
        label: 'Ver',
        onClick: () => console.log('Ação clicada'),
      },
      duration: 0, // Não desaparece automaticamente
    })
  }

  const handleNotificationWithImage = () => {
    addNotification({
      type: 'info',
      title: 'Imagem Compartilhada',
      body: (
        <Box
          component="img"
          src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
          alt="Imagem"
          sx={{ width: '100%', borderRadius: 1, mt: 1 }}
        />
      ),
      avatar: user?.avatar,
      duration: 5000,
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: '100vw' }}>
      {/* Header */}
      <NavBar />

      {/* Main Content */}
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Perfil */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h4" gutterBottom>
              Bem-vindo, {user?.name}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Email: {user?.email}
            </Typography>
          </Box>

          {/* Exemplos de Notificações */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Exemplos de Notificações
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Clique em um botão para ver diferentes tipos de notificações:
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="info"
                onClick={handleNotificationInfo}
              >
                Info
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleNotificationSuccess}
              >
                Success
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={handleNotificationWarning}
              >
                Warning
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleNotificationError}
              >
                Error
              </Button>
              <Button
                variant="contained"
                onClick={handleNotificationWithAction}
              >
                Com Ação
              </Button>
              <Button
                variant="contained"
                onClick={handleNotificationWithImage}
              >
                Com Imagem
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" sx={{ mt: 4, color: 'textSecondary' }}>
            A interface de chat será implementada aqui em breve.
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}
