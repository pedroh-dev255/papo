import {
  Box,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  SpeedDial,
  SpeedDialAction,
  Paper,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import ChatIcon from '@mui/icons-material/Chat'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import GroupAddIcon from '@mui/icons-material/GroupAdd'

import { useAuth } from "../contexts/AuthContext";
import NavBar from '../components/navbar';
import { chatService } from "../services/chatService"
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';


export default function Home() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const getChats = async () => {
      try {
        const res = await chatService.getInitialChats(token);

        if(!res || res.length == 0){
          toast.error("Erro ao buscar Conversas");
          return;
        }
        //console.log(res)
        setChats(res.chats);
      } catch (error) {
        console.error(error.message)
        toast.error(error.message);
      }

    };

    getChats();
  }, []);

  function formatChatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - target) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (diffDays === 1) {
      return "Ontem";
    }

    if (diffDays < 7) {
      return date.toLocaleDateString("pt-BR", {
        weekday: "short",
      }).replace(".", "");
    }

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  const hasContacts = chats.length > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <NavBar />
      <Box sx={{ bgcolor: 'background.paper', pt: 6 }} />
      <Box
        sx={{
          flex: 1,

          overflowY: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        <List disablePadding>
          {hasContacts ? (
            // Lista de contatos (quando existem)
            <List disablePadding>
              {chats.map((contact) => (
                <ListItemButton
                  key={contact.id}
                  onClick={() => navigate(`/conversa/${contact.id}`)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ListItemAvatar sx={{ mr: 1 }}>
                    <Avatar
                      src={contact.avatar}
                      sx={{ width: 52, height: 52 }}
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography fontWeight={600}>
                          {contact.nome}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatChatDate(contact.updated_at)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                      >
                        {contact.last_message}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          ) : (
            // Mensagem quando não há contatos
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  maxWidth: 400,
                  bgcolor: 'transparent',
                }}
              >
                <ChatIcon
                  sx={{
                    fontSize: 80,
                    color: 'text.disabled',
                    mb: 2,
                  }}
                />
                <Typography variant="h5" gutterBottom color="text.primary">
                  Nenhum contato
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Você ainda não tem nenhuma conversa.
                  <br />
                  Clique no botão abaixo para iniciar uma nova conversa ou criar um grupo.
                </Typography>
              </Paper>
            </Box>
          )}
        </List>

      </Box>
      <SpeedDial
        ariaLabel="Nova conversa"
        icon={<AddIcon />}
        direction="up"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <SpeedDialAction
          icon={<PersonAddAlt1Icon />}
          tooltipTitle="Nova conversa"
          onClick={() => {
            console.log('Nova conversa')
          }}
        />

        <SpeedDialAction
          icon={<GroupAddIcon />}
          tooltipTitle="Novo grupo"
          onClick={() => {
            console.log('Novo grupo')
          }}
        />
      </SpeedDial>

    </Box>
  )
}
