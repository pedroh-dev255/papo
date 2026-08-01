import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Chip,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Send,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  Phone,
  Videocam,
  ArrowBack,
} from "@mui/icons-material";

function MessageBubble({ message, isOwn }) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "70%",
          bgcolor: isOwn ? "primary.main" : "background.paper",
          color: isOwn ? "white" : "text.primary",
          borderRadius: 2,
          px: 2,
          py: 1.5,
          boxShadow: 1,
          position: "relative",
        }}
      >
        <Typography variant="body2">{message.text}</Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            color: isOwn ? "rgba(255,255,255,0.7)" : "text.secondary",
            textAlign: "right",
          }}
        >
          {message.time}
        </Typography>
      </Box>
    </Box>
  );
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const [chatInfo] = useState({
    name: "Equipe Design",
    avatar: "https://i.pravatar.cc/150?img=5",
    online: true,
  });

  useEffect(() => {
    const demoMessages = [
      {
        id: 1,
        text: "Olá pessoal! Como está o projeto?",
        time: "10:30",
        isOwn: false,
      },
      {
        id: 2,
        text: "Está indo muito bem! Finalizamos a parte do frontend.",
        time: "10:32",
        isOwn: true,
      },
      {
        id: 3,
        text: "Ótimo! Podemos marcar uma reunião para alinhar?",
        time: "10:35",
        isOwn: false,
      },
      {
        id: 4,
        text: "Claro! Como seria amanhã às 15h?",
        time: "10:36",
        isOwn: true,
      },
    ];
    setMessages(demoMessages);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          text: "Mensagem recebida! Em breve responderei.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: false,
        };
        setMessages((prev) => [...prev, reply]);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header do chat */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton onClick={() => navigate("/")} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>

        <Avatar
          src={chatInfo.avatar}
          alt={chatInfo.name}
          sx={{ width: 40, height: 40, mr: 2 }}
        >
          {chatInfo.name[0]}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {chatInfo.name}
          </Typography>
          <Chip
            label={chatInfo.online ? "Online" : "Offline"}
            size="small"
            color={chatInfo.online ? "success" : "default"}
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        </Box>

        <IconButton color="inherit">
          <Phone />
        </IconButton>
        <IconButton color="inherit">
          <Videocam />
        </IconButton>
        <IconButton color="inherit">
          <MoreVert />
        </IconButton>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          bgcolor: "background.default",
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.isOwn} />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <IconButton color="primary">
            <AttachFile />
          </IconButton>

          <IconButton color="primary">
            <EmojiEmotions />
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "background.default",
              },
            }}
          />

          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            <Send />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
}