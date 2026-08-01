import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
} from "@mui/material";
import {
  People,
  Error,
  Home as HomeIcon,
  ArrowBack,
} from "@mui/icons-material";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#e6e6e6",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            bgcolor: "#d4d4d4",
            border: "1px solid #bebebe",
            textAlign: "center",
          }}
        >
          {/* Ícone */}
          <Box sx={{ mb: 3 }}>
            <Error
              sx={{
                fontSize: 64,
                color: "#555555",
                border: "1px solid #bebebe",
                p: 1,
              }}
            />
          </Box>

          {/* Título */}
          <Typography
            variant="h1"
            sx={{
              fontSize: "72px",
              fontWeight: 400,
              color: "#555555",
              letterSpacing: "2px",
              mb: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              color: "#555555",
              letterSpacing: "0.5px",
              mb: 2,
              fontSize: "20px",
            }}
          >
            Página não encontrada
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#777777",
              mb: 4,
              fontSize: "14px",
            }}
          >
            A página que você está procurando pode ter sido removida,
            renomeada ou está temporariamente indisponível.
          </Typography>

          {/* Botões */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{
                borderRadius: 0,
                bgcolor: "#333333",
                color: "#e0e0e0",
                fontWeight: 400,
                letterSpacing: "0.5px",
                fontSize: "14px",
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: "#444444",
                },
                '& .MuiButton-startIcon': {
                  color: "#777777",
                }
              }}
            >
              Voltar ao início
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 0,
                color: "#555555",
                border: "1px solid #555555",
                fontWeight: 400,
                letterSpacing: "0.5px",
                fontSize: "14px",
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: "#c4c4c4",
                  border: "1px solid #555555",
                },
                '& .MuiButton-startIcon': {
                  color: "#777777",
                }
              }}
            >
              Voltar
            </Button>
          </Box>

          {/* Rodapé */}
          <Box
            sx={{
              mt: 4,
              pt: 2,
              borderTop: "1px solid #bebebe",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#777777",
                fontSize: "11px",
                letterSpacing: "0.3px",
              }}
            >
              © 2026 - PH Core | v1.0
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}