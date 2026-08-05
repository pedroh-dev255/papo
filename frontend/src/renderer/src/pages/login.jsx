// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  Key,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import icon from "../assets/papo_circle.svg";

import { authService } from "../services/authService";
import default_profile from "../assets/default_profile.svg"
import { saveStorage, removeStorage, getStorage } from "../services/storage";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [salvarCodigo, setSalvarCodigo] = useState(true);
  const [salvarUser, setSalvarUser] = useState(true);

  useEffect(()=>{
    const cod = getStorage("login_codigo");
    if(cod){
      setCodigo(cod);
    }

    const email = getStorage("login_email");
    if(email){
      setEmail(email);
    }

  },[])

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(email, password, codigo, salvarCodigo, salvarUser);

      if( email == "" || password == "" || codigo == ""){
        throw new Error("Preencha todos os campos!");
      }

      saveStorage("login_codigo", salvarCodigo ? codigo: null);

      saveStorage("login_email", salvarUser ? email : null);

      // Realiza o login
      const response = await authService.login(email, password, codigo);

      console.log(response);

      if(response.success !== true){
        throw new Error(response.message || "Erro ao realizar login!");
      }

      const userData = {
        id: response.user.userdata.id,
        name: response.user.userdata.nome,
        email: response.user.userdata.email,
        avatar: response.user.userdata.avatar || default_profile,
        unit_id: response.user.userdata.unit_id,
        codigo,
      };

      login(userData, response.user.token);

      toast.success("Login realizado com sucesso!");
      navigate("/", { replace: true });

    } catch (error) {

      toast.error(error.message || "Erro ao fazer login. Verifique suas credenciais.");
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
                letterSpacing: "0.3px",
              }}
            >
              Comunicação Interna
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Código da Empresa"
              type="text"
              margin="normal"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 0,
                  bgcolor: "#eeeded",
                  "& fieldset": {
                    borderColor: "#bebebe",
                  },
                  "&:hover fieldset": {
                    borderColor: "#525252",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#353535",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#4e4e4e",
                  "&.Mui-focused": {
                    color: "#4e4e4e",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#494949",
                },
                "& .MuiFormHelperText-root": {
                  color: "#e41414",
                  marginLeft: 0,
                },
                "& .Mui-error .MuiOutlinedInput-root fieldset": {
                  borderColor: "#e41414",
                },
                "& .Mui-error .MuiFormHelperText-root": {
                  color: "#cc3333",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key sx={{ color: "#555", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 0,
                  bgcolor: "#eeeded",
                  "& fieldset": {
                    borderColor: "#bebebe",
                  },
                  "&:hover fieldset": {
                    borderColor: "#525252",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#353535",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#4e4e4e",
                  "&.Mui-focused": {
                    color: "#4e4e4e",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#494949",
                },
                "& .MuiFormHelperText-root": {
                  color: "#e41414",
                  marginLeft: 0,
                },
                "& .Mui-error .MuiOutlinedInput-root fieldset": {
                  borderColor: "#e41414",
                },
                "& .Mui-error .MuiFormHelperText-root": {
                  color: "#cc3333",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#555", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 0,
                  bgcolor: "#eeeded",
                  "& fieldset": {
                    borderColor: "#bebebe",
                  },
                  "&:hover fieldset": {
                    borderColor: "#525252",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#353535",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#4e4e4e",
                  "&.Mui-focused": {
                    color: "#4e4e4e",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#494949",
                },
                "& .MuiFormHelperText-root": {
                  color: "#e41414",
                  marginLeft: 0,
                },
                "& .Mui-error .MuiOutlinedInput-root fieldset": {
                  borderColor: "#e41414",
                },
                "& .Mui-error .MuiFormHelperText-root": {
                  color: "#cc3333",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#555", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#555" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={salvarCodigo}
                    onChange={(e) => setSalvarCodigo(e.target.checked)}
                    sx={{
                      color: "#555",
                      "&.Mui-checked": {
                        color: "#333",
                      },
                    }}
                  />
                }
                label="Salvar código da empresa"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    color: "#555",
                    fontSize: "14px",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={salvarUser}
                    onChange={(e) => setSalvarUser(e.target.checked)}
                    sx={{
                      color: "#555",
                      "&.Mui-checked": {
                        color: "#333",
                      },
                    }}
                  />
                }
                label="Salvar usuário"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    color: "#555",
                    fontSize: "14px",
                  },
                }}
              />
            </FormGroup>

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
                bgcolor: "#333",
                color: "#e0e0e0",
                fontWeight: 400,
                letterSpacing: "0.5px",
                fontSize: "14px",
                "&:hover": {
                  bgcolor: "#444",
                },
                "&:disabled": {
                  bgcolor: "#222",
                  color: "#555",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#666" }} />
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
                color: "#444",
                fontSize: "11px",
                letterSpacing: "0.3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <Business sx={{ fontSize: 14, color: "#333" }} />
              <span>© 2026 - </span>
              <a
                href="https://www.phcore.com.br"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#555",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#999")}
                onMouseLeave={(e) => (e.target.style.color = "#555")}
              >
                PH Core
              </a>
              <span style={{ color: "#333" }}>|</span>
              <span style={{ color: "#333" }}>v1.0</span>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
