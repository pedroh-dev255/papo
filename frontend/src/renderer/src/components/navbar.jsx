import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Badge,
    Box,
    Menu,
    MenuItem,
    Divider,
} from "@mui/material";
import {
    Chat as ChatIcon,
    Notifications,
    Search,
    Settings,
    Logout,
    Person,
    People,
    Forum,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import icon from "../assets/papo_circle.svg"


// Animação de piscar
const blink = keyframes`
    0% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(1.1);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`;

// Badge com animação de piscar
const AnimatedBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        backgroundColor: "#cc3333",
        color: "#ffffff",
        fontSize: "5px",
        fontWeight: 400,
        height: 18,
        minWidth: 18,
        borderRadius: 50,
        border: "1px solid #bebebe",
        animation: `${blink} 1.5s ease-in-out infinite`,
        '&:hover': {
            animation: 'none',
        }
    },
}));

// Badge de status online (sem animação)
const StatusBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        backgroundColor: "#44b700",
        color: "#44b700",
        boxShadow: `0 0 0 2px #d4d4d4`,
        borderRadius: "50%",
        border: 'none',
        '&::after': {
            display: 'none',
        }
    }
}));

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState(3);
    const [user, setUser] = useState(() => {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    });

    // Simular novas notificações
    useEffect(() => {
        const interval = setInterval(() => {
            // Simula chegada de nova notificação a cada 10 segundos
            setNotifications(prev => prev + 1);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
        // Limpa notificações ao abrir o menu (opcional)
        // setNotifications(0);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleNavigate = (path) => {
        navigate(path);
        handleMenuClose();
    };

    // Função para marcar notificações como lidas
    const handleNotificationsClick = () => {
        setNotifications(0);
        // Navegar para página de notificações
        handleNavigate("/a");
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: 1200,
                bgcolor: "#d4d4d4",
                color: "#555555",
                boxShadow: "none",
                borderBottom: "1px solid #bebebe",
                justifyContent: "center",
                height: 50,
            }}
        >
            <Toolbar
                sx={{
                    minHeight: 50,
                    px: 2,
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >
                {/* Logo */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        gap: 1,
                    }}
                    onClick={() => navigate("/")}
                >
                    <Box
                        component="img"
                        src={icon}
                        alt="Papo"
                        sx={{
                            width: 28,
                            height: 28,
                            display: "block",
                        }}
                    />
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 400,
                            color: "#555555",
                            letterSpacing: "0.5px",
                            fontSize: "16px",
                        }}
                    >
                        Papo
                    </Typography>
                </Box>

                {/* Menu central - removido conforme solicitado */}

                {/* Ações da direita */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                        size="small"
                        sx={{
                            color: "#888888",
                            borderRadius: 0,
                            p: 1,
                            '&:hover': {
                                bgcolor: "#c4c4c4",
                                color: "#555555"
                            }
                        }}
                    >
                        <Search fontSize="small" />
                    </IconButton>

                    <IconButton
                        size="small"
                        sx={{
                            color: "#888888",
                            borderRadius: 0,
                            p: 1,
                            '&:hover': {
                                bgcolor: "#c4c4c4",
                                color: "#555555"
                            }
                        }}
                        onClick={() => handleNavigate("/contacts")}
                    >
                        <People fontSize="small" />
                    </IconButton>

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            bgcolor: "#bebebe",
                            mx: 0.5,
                            height: 20,
                            alignSelf: "center",
                        }}
                    />

                    {/* Avatar do usuário */}
                    <IconButton
                        onClick={handleMenuOpen}
                        size="small"
                        sx={{
                            p: 0.5,
                            '&:hover': {
                                bgcolor: "#c4c4c4"
                            }
                        }}
                    >
                        <StatusBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            variant="dot"
                        >
                            <Avatar
                                src={user?.avatar}
                                alt={user?.name || "Usuário"}
                                sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: "#bebebe",
                                    color: "#555555",
                                    fontSize: "12px",
                                    fontWeight: 400,
                                    borderRadius: 0,
                                    border: "1px solid #bebebe",
                                }}
                            >
                                {user?.name?.[0]?.toUpperCase() || "U"}
                            </Avatar>
                        </StatusBadge>
                    </IconButton>
                </Box>

                {/* Menu dropdown do usuário */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right"
                    }}
                    sx={{
                        '& .MuiPaper-root': {
                            bgcolor: "#d4d4d4",
                            color: "#555555",
                            borderRadius: 0,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            border: "1px solid #bebebe",
                            minWidth: 180,
                            mt: 0.5,
                        }
                    }}
                >
                    <Box sx={{ px: 2, py: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#555555",
                                fontWeight: 400,
                                fontSize: "13px"
                            }}
                        >
                            {user?.name || "Usuário"}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#777777",
                                fontSize: "11px"
                            }}
                        >
                            {user?.email || "usuario@email.com"}
                        </Typography>
                    </Box>

                    <Divider sx={{ bgcolor: "#bebebe" }} />

                    <MenuItem
                        onClick={() => handleNavigate("/profile")}
                        sx={{
                            fontSize: "13px",
                            color: "#555555",
                            py: 1,
                            px: 2,
                            '&:hover': {
                                bgcolor: "#c4c4c4"
                            }
                        }}
                    >
                        <Person sx={{ fontSize: 16, mr: 1.5, color: "#777777" }} />
                        Perfil
                    </MenuItem>

                    <MenuItem
                        onClick={() => handleNavigate("/settings")}
                        sx={{
                            fontSize: "13px",
                            color: "#555555",
                            py: 1,
                            px: 2,
                            '&:hover': {
                                bgcolor: "#c4c4c4"
                            }
                        }}
                    >
                        <Settings sx={{ fontSize: 16, mr: 1.5, color: "#777777" }} />
                        Configurações
                    </MenuItem>

                    <Divider sx={{ bgcolor: "#bebebe" }} />

                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            fontSize: "13px",
                            color: "#cc3333",
                            py: 1,
                            px: 2,
                            '&:hover': {
                                bgcolor: "#c4c4c4"
                            }
                        }}
                    >
                        <Logout sx={{ fontSize: 16, mr: 1.5, color: "#cc3333" }} />
                        Sair
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
