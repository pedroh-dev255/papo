import {
  Box,
  Avatar,
  Typography,
  Paper,
  Divider,
  IconButton,
  Fab,
  CircularProgress,
  Dialog
} from '@mui/material';

import {
  ArrowBack,
  EmailOutlined,
  PhoneOutlined,
  BusinessOutlined,
  ChatOutlined,
  PersonOutline,
  Close
} from '@mui/icons-material';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from "../contexts/AuthContext";
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from "../services/profileService";
import { chatService } from "../services/chatService"
import NavBar from '../components/navbar'

export default function Perfil() {

  const [perfil, setPerfil] = useState(null);
  const [fromMe, setFromMe] = useState(false);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {

    const getProfile = async () => {

      try {

        setLoading(true);

        const res = await profileService.getProfile(token, id);

        if (!res || !res.data) {
          toast.error("Erro ao buscar perfil");
          return;
        }

        setPerfil(res.data);
        setFromMe(res.fromMe); // "Meu perfil" || Perfil do user X
      } catch (error) {

        console.error(error);

        toast.error(
          error.message || "Erro ao buscar perfil"
        );

      } finally {

        setLoading(false);

      }

    };

    if (id && token) {
      getProfile();
    }

  }, [id, token]);



  async function getChat(contactId) {
    try {
      const chatId = await chatService.getChat(token, contactId);
      if (!chatId || chatId == null) {
        throw new Error("ChatId invalido!");
      }
      navigate(`/conversa/${chatId.chat}`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  function handleAvatarClick() {
    if (!perfil?.avatar) {
      toast("Foto de perfil não existe.");
      return;
    }

    setAvatarOpen(true);
  }


  /*
   * Loading
   */
  if (loading) {

    return (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <NavBar />
        <CircularProgress />
      </Box>
    );

  }


  /*
   * Perfil não encontrado
   */
  if (!perfil) {

    return (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: 3,
          textAlign: 'center',
        }}
      >
        <NavBar />
        <PersonOutline
          sx={{
            fontSize: 64,
            color: 'text.secondary',
            mb: 2,
          }}
        />

        <Typography
          variant="h6"
          fontWeight={600}
        >
          Perfil não encontrado
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Não foi possível encontrar as informações deste contato.
        </Typography>

      </Box>
    );

  }


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

      {/* Conteúdo */}
      <Box
        sx={{
          flex: 1,
          pt: 6,
          pb: 10,
          px: { xs: 1, sm: 2, md: 3 },
          overflowY: 'auto',
        }}
      >



        {/* Card principal */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            marginTop: 2
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              mr: 1,
              scale: 1.2
            }}
          >
            <ArrowBack />
          </IconButton>
          {/* Área do avatar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              px: 2,
            }}
          >

            <Avatar
              src={perfil.avatar || undefined}
              alt={perfil.nome}
              onClick={handleAvatarClick}
              sx={{
                width: 120,
                height: 120,
                fontSize: 42,
                mb: 2,
                boxShadow: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.03)',
                },
              }}
            >
              {perfil.nome?.charAt(0)?.toUpperCase()}
            </Avatar>


            <Typography
              variant="h5"
              fontWeight={700}
              textAlign="center"
            >
              {perfil.nome}
            </Typography>

          </Box>


          <Divider />


          {/* Informações */}
          <Box>

            {/* Email */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 2,
              }}
            >

              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  mr: 2,
                  flexShrink: 0,
                }}
              >
                <EmailOutlined
                  color="action"
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  E-mail
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    wordBreak: 'break-word',
                  }}
                >
                  {perfil.email || 'Não informado'}
                </Typography>

              </Box>

            </Box>


            <Divider />


            {/* Telefone */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 2,
              }}
            >

              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  mr: 2,
                  flexShrink: 0,
                }}
              >
                <PhoneOutlined />
              </Box>

              <Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Telefone
                </Typography>

                <Typography variant="body1">
                  {perfil.telefone || 'Não informado'}
                </Typography>

              </Box>

            </Box>


            <Divider />


            {/* Ramal */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 2,
              }}
            >

              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  mr: 2,
                  flexShrink: 0,
                }}
              >
                <PhoneOutlined />
              </Box>

              <Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Ramal
                </Typography>

                <Typography variant="body1">
                  {perfil.ramal || 'Não informado'}
                </Typography>

              </Box>

            </Box>


            <Divider />


            {/* Unidade */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 2,
              }}
            >

              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  mr: 2,
                  flexShrink: 0,
                }}
              >
                <BusinessOutlined />
              </Box>

              <Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Unidade
                </Typography>

                <Typography variant="body1">
                  {perfil.unidade ||
                    perfil.unit_id ||
                    'Não informado'}
                </Typography>

              </Box>

            </Box>

          </Box>

        </Paper>

      </Box>


      {/* Botão iniciar conversa */}
      <Fab
        color="primary"
        variant="extended"
        onClick={async () => {
          if (fromMe) {
            console.log(
              "Editar Perfil meu perfil. Id:",
              perfil.id
            );
          } else {
            await getChat(Number(perfil.id));
          }

        }}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          px: 3,
          boxShadow: 4,
        }}
      >
        {fromMe ? (
          <>

            Editar
          </>
        ) : (
          <>
            <ChatOutlined
              sx={{
                mr: 1,
              }}
            />

            Conversar
          </>
        )}


      </Fab>
      <Dialog
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
          },
        }}
      >
        <IconButton
          onClick={() => setAvatarOpen(false)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Box
            component="img"
            src={perfil.avatar}
            alt={perfil.nome}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />
        </Box>
      </Dialog>

    </Box>
  );
}
