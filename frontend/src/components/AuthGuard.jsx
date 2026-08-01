import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    // TODO: Validar token no backend
    setTimeout(() => {
      setAuthenticated(true);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#e6e6e6",
        }}
      >
        <CircularProgress 
          sx={{ 
            color: "#555555",
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'butt',
            }
          }} 
        />
      </Box>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}