import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listen } from "@tauri-apps/api/event";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    let unlisten;

    (async () => {
      unlisten = await listen("open-notification-message", (event) => {
        const payload = event.payload;
        const chatId = payload?.chat_id || 1;
        navigate(`/chat/${chatId}`);
      });
    })();

    return () => {
      if (typeof unlisten === "function") {
        unlisten();
      }
    };
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Navbar fixa no topo */}
      <Navbar />
      
      {/* Conteúdo principal com padding para compensar a navbar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8, // Altura da navbar (64px + padding)
          overflow: "auto",
          bgcolor: "background.default",
          height: "calc(100vh - 64px)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
