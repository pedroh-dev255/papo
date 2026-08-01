import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Close,
  Check,
  DoneAll,
  Delete,
  DeleteSweep,
  Info,
  Warning,
  Error,
} from '@mui/icons-material';
import notificationService from '../services/notificationService';
import toast from "react-hot-toast";

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Carregar notificações iniciais
    notificationService.loadNotifications();

    // Listeners
    const unsubscribe = notificationService.addListener((event, data) => {
      try {
        switch (event) {
          case 'load':
          case 'new':
          case 'delete':
          case 'markAllRead':
          case 'clearAll':
            setNotifications(notificationService.getNotifications());
            setUnreadCount(notificationService.unreadCount);
            break;
          case 'update':
            setNotifications(notificationService.getNotifications());
            setUnreadCount(notificationService.unreadCount);
            break;
          default:
            break;
        }
      } catch (error) {
        toast.error('Erro ao carregar notificações');
      }
    });

    return unsubscribe;
  }, []);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
  };

  const handleDelete = async (id) => {
    await notificationService.deleteNotification(id);
  };

  const handleClearAll = async () => {
    await notificationService.clearAll();
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Critical':
        return <Error sx={{ color: '#cc3333' }} />;
      case 'High':
        return <Warning sx={{ color: '#ff9800' }} />;
      case 'Normal':
        return <Info sx={{ color: '#2196f3' }} />;
      default:
        return <Info sx={{ color: '#888888' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return '#cc3333';
      case 'High':
        return '#ff9800';
      case 'Normal':
        return '#2196f3';
      default:
        return '#888888';
    }
  };

  return (
    <>
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
        onClick={handleOpen}
      >
        <Badge
          badgeContent={unreadCount}
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: '#cc3333',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 400,
              height: 18,
              minWidth: 18,
              borderRadius: 0,
              border: '1px solid #bebebe',
            }
          }}
        >
          {unreadCount > 0 ? <NotificationsActive fontSize="small" /> : <Notifications fontSize="small" />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            bgcolor: '#d4d4d4',
            borderRadius: 0,
            border: '1px solid #bebebe',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            mt: 0.5,
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #bebebe'
        }}>
          <Typography sx={{ color: '#555555', fontWeight: 400, fontSize: '14px' }}>
            Notificações
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAll sx={{ fontSize: 16 }} />}
                onClick={handleMarkAllRead}
                sx={{
                  borderRadius: 0,
                  color: '#555555',
                  fontSize: '12px',
                  '&:hover': {
                    bgcolor: '#c4c4c4',
                  }
                }}
              >
                Ler todas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                size="small"
                startIcon={<DeleteSweep sx={{ fontSize: 16 }} />}
                onClick={handleClearAll}
                sx={{
                  borderRadius: 0,
                  color: '#cc3333',
                  fontSize: '12px',
                  '&:hover': {
                    bgcolor: '#c4c4c4',
                  }
                }}
              >
                Limpar
              </Button>
            )}
          </Box>
        </Box>

        {/* Lista de notificações */}
        <Box sx={{ overflow: 'auto', maxHeight: 350 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Notifications sx={{ fontSize: 40, color: '#999999', mb: 1 }} />
              <Typography sx={{ color: '#777777', fontSize: '13px' }}>
                Nenhuma notificação
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    borderBottom: '1px solid #c8c8c8',
                    bgcolor: notification.read ? 'transparent' : '#dedede',
                    '&:hover': {
                      bgcolor: '#c4c4c4',
                    },
                    alignItems: 'flex-start',
                    p: 1.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    {getPriorityIcon(notification.priority)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography
                          sx={{
                            color: '#555555',
                            fontSize: '13px',
                            fontWeight: notification.read ? 400 : 600,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                          {!notification.read && (
                            <IconButton
                              size="small"
                              onClick={() => handleMarkAsRead(notification.id)}
                              sx={{
                                color: '#777777',
                                p: 0.5,
                                '&:hover': {
                                  bgcolor: '#bebebe',
                                }
                              }}
                            >
                              <Check sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(notification.id)}
                            sx={{
                              color: '#777777',
                              p: 0.5,
                              '&:hover': {
                                bgcolor: '#bebebe',
                              }
                            }}
                          >
                            <Close sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          sx={{
                            color: '#777777',
                            fontSize: '12px',
                            mt: 0.5,
                          }}
                        >
                          {notification.body}
                        </Typography>
                        <Typography
                          sx={{
                            color: '#999999',
                            fontSize: '10px',
                            mt: 0.5,
                            display: 'block',
                          }}
                        >
                          {notification.timestamp}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ 
          p: 1, 
          borderTop: '1px solid #bebebe',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Typography sx={{ color: '#999999', fontSize: '10px' }}>
            {notifications.length} notificações • {unreadCount} não lidas
          </Typography>
        </Box>
      </Menu>
    </>
  );
}