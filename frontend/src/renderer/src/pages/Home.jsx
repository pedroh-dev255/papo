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
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import GroupAddIcon from '@mui/icons-material/GroupAdd'

import NavBar from '../components/navbar'

const contacts = [
  {
    id: 1,
    name: 'João Silva',
    lastMessage: 'E aí, tudo certo?',
    time: '09:15',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'Maria Oliveira',
    lastMessage: 'Te enviei os arquivos.',
    time: '08:42',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 3,
    name: 'Carlos Santos',
    lastMessage: 'Vamos fazer a reunião às 14h.',
    time: 'Ontem',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 4,
    name: 'Ana Costa',
    lastMessage: '😂😂😂',
    time: 'Ontem',
    avatar: 'https://i.pravatar.cc/150?img=20',
  },
  {
    id: 5,
    name: 'Equipe TI',
    lastMessage: 'Servidor reiniciado com sucesso.',
    time: 'Seg',
    avatar: 'https://i.pravatar.cc/150?img=30',
  },
  {
    id: 6,
    name: 'Carlos Santos',
    lastMessage: 'Vamos fazer a reunião às 14h.',
    time: 'Ontem',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 7,
    name: 'Ana Costa',
    lastMessage: '😂😂😂',
    time: 'Ontem',
    avatar: 'https://i.pravatar.cc/150?img=20',
  },
  {
    id: 8,
    name: 'Equipe TI',
    lastMessage: 'Servidor reiniciado com sucesso.',
    time: 'Seg',
    avatar: 'https://i.pravatar.cc/150?img=30',
  },
]

export default function Home() {
  const navigate = useNavigate();


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
          {contacts.map((contact) => (
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
                      {contact.name}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {contact.time}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                  >
                    {contact.lastMessage}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
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
