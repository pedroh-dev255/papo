import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Badge,
  Button,
  List,
  ListItem,
  ListItemButton,
  Chip,
  Container,
  Fab,
  useTheme,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import toast from "react-hot-toast";

import notificationService from '../services/notificationService';

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

// Componente de chat recente
function RecentChat({ chat, onClick }) {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={onClick} sx={{ borderRadius: 2 }}>
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          sx={{ mr: 2 }}
        >
          <Avatar
            src={chat.avatar}
            alt={chat.name}
            sx={{ width: 48, height: 48 }}
          >
            {chat.name[0]}
          </Avatar>
        </StyledBadge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" noWrap fontWeight={600}>
              {chat.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {chat.time}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" noWrap>
            {chat.lastMessage}
          </Typography>
        </Box>
        {chat.unread > 0 && (
          <Chip
            label={chat.unread}
            size="small"
            color="primary"
            sx={{ ml: 1, minWidth: 20 }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Dados de exemplo
  const [chats] = useState([
    {
      id: 1,
      name: "Equipe Design",
      avatar: "https://i.pravatar.cc/150?img=5",
      lastMessage: "Ótimo trabalho no projeto!",
      time: "10:30",
      unread: 3,
      online: true,
    },
    {
      id: 2,
      name: "Desenvolvimento",
      avatar: "https://i.pravatar.cc/150?img=8",
      lastMessage: "Precisamos revisar o código",
      time: "09:15",
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: "Marketing",
      avatar: "https://i.pravatar.cc/150?img=12",
      lastMessage: "Campanha de lançamento",
      time: "Ontem",
      unread: 5,
      online: true,
    },
    {
      id: 4,
      name: "RH - Recrutamento",
      avatar: "https://i.pravatar.cc/150?img=15",
      lastMessage: "Novos candidatos para entrevista",
      time: "Ontem",
      unread: 2,
      online: false,
    },
  ]);

    const handleTestNotification = async () => {
        try {
            await notificationService.sendNotification(
                'Teste de Notificação',
                'Esta é uma notificação de teste do sistema Papo',
                'Normal',
                [
                    { id: 'open', label: 'Abrir', action_type: 'open' },
                    { id: 'dismiss', label: 'Dispensar', action_type: 'dismiss' }
                ]
            );
            toast.success('Notificação enviada!');
        } catch (error) {
            toast.error('Erro ao enviar notificação');
        }
    };


  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="lg">
        <Button
            variant="contained"
            onClick={handleTestNotification}
            sx={{
                borderRadius: 0,
                bgcolor: '#333333',
                color: '#e0e0e0',
                '&:hover': { bgcolor: '#444444' }
            }}
        >
            Testar Notificação
        </Button>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {chats.map((chat) => (
            <RecentChat
              key={chat.id}
              chat={chat}
              onClick={() => handleChatClick(chat.id)}
            />
          ))}
        </Box>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            boxShadow: 4,
          }}
        >
          <Add />
        </Fab>
      </Container>
    </Box>
  );
}