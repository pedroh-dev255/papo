import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NavBar from '../components/navbar'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const messages = [
  {
    id: 1,
    fromMe: false,
    text: 'Bom dia!',
    time: '09:10',
  },
  {
    id: 2,
    fromMe: true,
    text: 'Bom dia! Tudo bem?',
    time: '09:11',
  },
  {
    id: 3,
    fromMe: false,
    text: 'Tudo sim. Você conseguiu terminar o projeto?',
    time: '09:12',
  },
  {
    id: 4,
    fromMe: true,
    text: 'Consegui sim. Vou te enviar ainda hoje.',
    time: '09:13',
  },
]

export default function Conversa() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <NavBar />

      {/* Container principal que ocupa todo o espaço restante */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0, // Importante para evitar overflow
          position: 'relative',
        }}
      >
        {/* Cabeçalho da conversa - fixo no topo */}
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            mt: 6,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0, // Não encolhe
          }}
        >
          <Toolbar>
            <IconButton sx={{ ml: -2 }} onClick={() => navigate(-1)}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <Avatar
              src="https://i.pravatar.cc/150?img=5"
              sx={{ mr: 2 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={600}>
                Maria Oliveira
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Online
              </Typography>
            </Box>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Área de mensagens - rolável */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0, // Permite que o box encolha
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 2,
            bgcolor: '#f5f5f5',
          }}
        >
          <Stack spacing={1.5}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.fromMe
                    ? 'flex-end'
                    : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: msg.fromMe
                      ? 'primary.main'
                      : 'background.paper',
                    color: msg.fromMe
                      ? 'primary.contrastText'
                      : 'text.primary',
                  }}
                >
                  <Typography>{msg.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.5,
                      opacity: 0.75,
                    }}
                  >
                    {msg.time}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Caixa de envio - fixa no rodapé */}
        <Box
          sx={{
            flexShrink: 0, // Não encolhe
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            <IconButton>
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              size="small"
              placeholder="Digite uma mensagem..."
            />
            <IconButton color="primary">
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
