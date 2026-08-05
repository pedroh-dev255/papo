import {
  Box,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material'
import NavBar from '../components/navbar'

const contacts = [
  {
    id: 1,
    name: 'João Silva',
    avatar: 'https://i.pravatar.cc/150?img=1',
    online: true,
  },
  {
    id: 2,
    name: 'Maria Oliveira',
    avatar: 'https://i.pravatar.cc/150?img=5',
    online: false,
  },
  {
    id: 3,
    name: 'Carlos Santos',
    avatar: 'https://i.pravatar.cc/150?img=12',
    online: true,
  },
  {
    id: 4,
    name: 'Ana Costa',
    avatar: 'https://i.pravatar.cc/150?img=20',
    online: false,
  },
  {
    id: 5,
    name: 'Equipe TI',
    avatar: 'https://i.pravatar.cc/150?img=30',
    online: true,
  },
  {
    id: 6,
    name: 'Juliana Lima',
    avatar: 'https://i.pravatar.cc/150?img=32',
    online: false,
  },
  {
    id: 7,
    name: 'Pedro Martins',
    avatar: 'https://i.pravatar.cc/150?img=36',
    online: true,
  },
  {
    id: 8,
    name: 'Fernanda Souza',
    avatar: 'https://i.pravatar.cc/150?img=40',
    online: false,
  },
]

export default function Contatos() {
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

      <Box
        sx={{
          flex: 1,
          pt: 6,
          bgcolor: 'background.default',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box>

        </Box>
        <List
          disablePadding
          sx={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {contacts.map((contact) => (
            <ListItemButton
              key={contact.id}
              sx={{
                px: 2,
                py: 1.5,
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
                  <Typography fontWeight={600}>
                    {contact.name}
                  </Typography>
                }
              />

              <Chip
                label={contact.online ? 'Online' : 'Offline'}
                color={contact.online ? 'success' : 'default'}
                size="small"
                variant={contact.online ? 'filled' : 'outlined'}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  )
}
