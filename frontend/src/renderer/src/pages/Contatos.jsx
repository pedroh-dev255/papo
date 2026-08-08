import {
  Box,
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Divider,
  Paper,
} from '@mui/material'
import NavBar from '../components/navbar'
import { contactService } from "../services/contactService"
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../contexts/AuthContext";

export default function Contatos() {
  const [contacts, setContacts] = useState({});
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const res = await contactService.getInitialContact(token);

        if (!res || !res.data) {
          toast.error("Erro ao buscar contatos");
          return;
        }

        setContacts(res.data);

      } catch (error) {
        console.error(error.message);
        toast.error(error.message);
      }
    };

    getContacts();
  }, [token]);

  const units = Object.entries(contacts);

  const hasContacts = units.some(
    ([, unit]) =>
      Array.isArray(unit.contatos) &&
    unit.contatos.length > 0
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <NavBar />
      <Box
        sx={{
          flex: 1,
          pt: 6,
          px: { xs: 1, sm: 2, md: 3 },
          pb: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        {/* Sem contatos */}
        {!hasContacts ? (
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              px: 3,
              bgcolor: 'background.paper',
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                mb: 2,
                bgcolor: 'action.hover',
                color: 'text.secondary',
                fontSize: 30,
              }}
            >
              👥
            </Avatar>

            <Typography
              variant="h6"
              fontWeight={600}
            >
              Nenhum contato disponível
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                maxWidth: 420,
              }}
            >
              Não existem contatos disponíveis para serem exibidos no momento.
            </Typography>
          </Paper>
        ) : (

          /* Lista */
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              pr: 0.5,

              '&::-webkit-scrollbar': {
                width: 6,
              },

              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'divider',
                borderRadius: 3,
              },
            }}
          >

            {units.map(([unitId, unit]) => {

              const users = unit.contatos;

              if (!Array.isArray(users) || users.length === 0) {
                return null;
              }
              //console.log(users)
              return (
                <Box
                  key={unitId}
                  sx={{
                    mb: 2,
                  }}
                >

                  {/* Cabeçalho da unidade */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 1.5,
                      py: 1,
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 22,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        mr: 1.2,
                      }}
                    />

                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                    >
                      {unit.nome}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {users.length} {users.length === 1 ? 'contato' : 'contatos'}
                    </Typography>
                  </Box>

                  {/* Lista de usuários */}
                  <Paper
                    elevation={0}
                    sx={{
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    }}
                  >

                    <List
                      disablePadding
                    >
                      {users.map((contact, index) => (
                        <Box key={contact.id}>

                          <ListItemButton
                            sx={{
                              px: { xs: 1.5, sm: 2 },
                              py: 1.25,
                              transition: 'background-color 0.15s ease',

                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                            onClick={() => navigate(`/perfil/${contact.id}`)}
                          >

                            <ListItemAvatar
                              sx={{
                                minWidth: 58,
                                mr: 0.5,
                              }}
                            >
                              <Avatar
                                src={contact.avatar || undefined}
                                alt={contact.nome}
                                sx={{
                                  width: 46,
                                  height: 46,
                                }}
                              >
                                {contact.nome?.charAt(0)?.toUpperCase()}
                              </Avatar>
                            </ListItemAvatar>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              noWrap
                            >
                              {contact.nome}
                            </Typography>
                          </ListItemButton>

                          {index < users.length - 1 && (
                            <Divider
                              sx={{
                                ml: 8.5,
                              }}
                            />
                          )}

                        </Box>
                      ))}
                    </List>

                  </Paper>

                </Box>
              );
            })}

          </Box>
        )}

      </Box>
    </Box>
  );
}
