import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Avatar, Box, Button, Typography } from "@mui/material";

export default function NotificationOverlay() {
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notificationId = params.get("notificationId");

    if (!notificationId) {
      setError("Notificação inválida.");
      return;
    }

    invoke("get_notification", { id: notificationId })
      .then((result) => {
        setNotification(result);
      })
      .catch((err) => {
        console.error("Erro ao carregar notificação:", err);
        setError("Não foi possível carregar a notificação.");
      });

    const timer = window.setTimeout(() => {
      getCurrentWindow().close();
    }, 7000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const handleOpen = async () => {
    if (!notification) {
      return;
    }

    try {
      await invoke("open_notification_target", { id: notification.id });
    } catch (error) {
      console.error("Erro ao abrir notificação:", error);
    } finally {
      getCurrentWindow().close();
    }
  };

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#e6e6e6",
          p: 2,
        }}
      >
        <Box
          sx={{
            width: 360,
            bgcolor: "#d4d4d4",
            border: "1px solid #bebebe",
            borderRadius: 0,
            p: 3,
            boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
          }}
        >
          <Typography color="#333" fontWeight={600} mb={1}>
            {error}
          </Typography>
          <Typography color="#666" fontSize="13px">
            Feche esta janela ou abra o aplicativo para continuar.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onClick={handleOpen}
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "transparent",
        p: 2,
        cursor: notification ? "pointer" : "default",
      }}
    >
      <Box
        sx={{
          width: 360,
          bgcolor: "#d4d4d4",
          border: "1px solid #bebebe",
          borderRadius: 0,
          boxShadow: "0 16px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Avatar
            src={notification?.avatar || ""}
            alt={notification?.user_name || notification?.title}
            sx={{ width: 64, height: 64, bgcolor: "#999" }}
          >
            {notification?.user_name?.[0] || notification?.title?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                color: "#333333",
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: 1.2,
              }}
            >
              {notification?.user_name || notification?.title}
            </Typography>
            <Typography
              sx={{
                color: "#666666",
                fontSize: "12px",
                mt: 0.5,
              }}
            >
              {notification?.title ? "Nova mensagem do sistema" : "Mensagem recebida"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3, pt: 0 }}>
          <Typography
            sx={{
              color: "#444444",
              fontSize: "14px",
              minHeight: 44,
              whiteSpace: "pre-line",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {notification?.body}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleOpen}
            sx={{
              mt: 2,
              borderRadius: 0,
              bgcolor: "#333333",
              color: "#e0e0e0",
              textTransform: "none",
              '&:hover': {
                bgcolor: '#444444',
              },
            }}
          >
            Abrir mensagem
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
