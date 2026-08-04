import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
} from "@mui/icons-material";
import KeyIcon from '@mui/icons-material/Key';
import { useAuth } from "../contexts/AuthContext";
import icon from "../assets/papo_circle.svg";

const schema = yup.object().shape({
  codigo : yup
    .string()
    .required("Email é obrigatório"),
  email: yup
    .string()
    .email("Email inválido")
    .required("Email é obrigatório"),
  password: yup
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .required("Senha é obrigatória"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // TODO: Integrar com a API real (backend ou IPC do Electron)
      // Para Electron, substitua a simulação pela chamada IPC:
      // const response = await window.electron.ipcRenderer.invoke('auth:login', data);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Gera um token e dados do usuário (substitua por dados reais da API)
      const token = `token-${Date.now()}`;
      const userData = {
        name: data.email.split("@")[0].charAt(0).toUpperCase() + data.email.split("@")[0].slice(1),
        email: data.email,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };

      // Usa o contexto de autenticação
      login(userData, token);

      toast.success("Login realizado com sucesso!");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#e6e6e6",
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 0,
            bgcolor: "#d4d4d4",
            border: "1px solid #e9e9e9",
          }}
          className="slide-up"
        >
          {/* Header com logo */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box
                component="img"
                src={icon}
                alt="Papo"
                sx={{
                  width: 48,
                  height: 48,
                  display: "block",
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 400,
                  color: "#555555",
                  letterSpacing: "1px",
                  fontSize: "28px",
                }}
              >
                Papo
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "13px",
                fontWeight: 300,
                letterSpacing: "0.3px"
              }}
            >
              Comunicação Interna
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>

            <TextField
              fullWidth
              label="Codigo"
              type="text"
              margin="normal"
              {...register("codigo")}
              error={!!errors.codigo}
              helperText={errors.codigo?.message}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: "#eeeded",
                  '& fieldset': {
                    borderColor: '#bebebe',
                  },
                  '&:hover fieldset': {
                    borderColor: '#525252',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#353535',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#4e4e4e',
                  '&.Mui-focused': {
                    color: '#4e4e4e',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#494949',
                },
                '& .MuiFormHelperText-root': {
                  color: '#e41414',
                  marginLeft: 0,
                },
                '& .Mui-error .MuiOutlinedInput-root fieldset': {
                  borderColor: '#e41414',
                },
                '& .Mui-error .MuiFormHelperText-root': {
                  color: '#cc3333',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon sx={{ color: '#555', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />


            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: "#eeeded",
                  '& fieldset': {
                    borderColor: '#bebebe',
                  },
                  '&:hover fieldset': {
                    borderColor: '#525252',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#353535',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#4e4e4e',
                  '&.Mui-focused': {
                    color: '#4e4e4e',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#494949',
                },
                '& .MuiFormHelperText-root': {
                  color: '#e41414',
                  marginLeft: 0,
                },
                '& .Mui-error .MuiOutlinedInput-root fieldset': {
                  borderColor: '#e41414',
                },
                '& .Mui-error .MuiFormHelperText-root': {
                  color: '#cc3333',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#555', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? "text" : "password"}
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: "#eeeded",
                  '& fieldset': {
                    borderColor: '#bebebe',
                  },
                  '&:hover fieldset': {
                    borderColor: '#525252',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#353535',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#4e4e4e',
                  '&.Mui-focused': {
                    color: '#4e4e4e',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#494949',
                },
                '& .MuiFormHelperText-root': {
                  color: '#e41414',
                  marginLeft: 0,
                },
                '& .Mui-error .MuiOutlinedInput-root fieldset': {
                  borderColor: '#e41414',
                },
                '& .Mui-error .MuiFormHelperText-root': {
                  color: '#cc3333',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#555', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#555' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography>
              Salvar Codigo
            </Typography>
            <Typography>
              Salvar Usuario
            </Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 0,
                bgcolor: '#333',
                color: '#e0e0e0',
                fontWeight: 400,
                letterSpacing: '0.5px',
                fontSize: '14px',
                '&:hover': {
                  bgcolor: '#444',
                },
                '&:disabled': {
                  bgcolor: '#222',
                  color: '#555',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#666' }} />
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Copyright */}
          <Box sx={{ mt: 4, textAlign: "center", pt: 2, borderTop: "1px solid #333" }}>
            <Typography
              variant="caption"
              sx={{
                color: '#444',
                fontSize: '11px',
                letterSpacing: '0.3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
              }}
            >
              <Business sx={{ fontSize: 14, color: '#333' }} />
              <span>© 2026 - </span>
              <a
                href="https://www.phcore.com.br"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#555',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#999'}
                onMouseLeave={(e) => e.target.style.color = '#555'}
              >
                PH Core
              </a>
              <span style={{ color: '#333' }}>|</span>
              <span style={{ color: '#333' }}>v1.0</span>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
