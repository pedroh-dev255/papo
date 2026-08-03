import { useNotification } from '../contexts/NotificationContext'
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Avatar,
  Button,
} from '@mui/material'
import { Close, Info, CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material'

const typeConfig = {
  info: { color: '#2196F3', icon: Info },
  success: { color: '#4CAF50', icon: CheckCircle },
  warning: { color: '#FF9800', icon: Warning },
  error: { color: '#F44336', icon: ErrorIcon },
}

function NotificationItem({ notification, onClose }) {
  const { title, body, avatar, type = 'info', action } = notification
  const config = typeConfig[type] || typeConfig.info

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${config.color}`,
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease-in-out',
        '@keyframes slideIn': {
          from: { transform: 'translateX(400px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Avatar e Ícone */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {avatar ? (
              <Avatar
                src={avatar}
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <config.icon sx={{ fontSize: 24 }} />
              </Box>
            )}
          </Box>

          {/* Conteúdo */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#333',
                mb: 0.5,
              }}
            >
              {title}
            </Typography>

            {typeof body === 'string' ? (
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {body}
              </Typography>
            ) : (
              <Box sx={{ mt: 1 }}>{body}</Box>
            )}
          </Box>

          {/* Botão fechar */}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#999',
              '&:hover': { color: '#333' },
              flexShrink: 0,
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>

      {/* Ação (se fornecida) */}
      {action && (
        <CardActions sx={{ pt: 0 }}>
          <Button
            size="small"
            sx={{ color: config.color }}
            onClick={() => {
              action.onClick?.()
              onClose()
            }}
          >
            {action.label}
          </Button>
        </CardActions>
      )}
    </Card>
  )
}

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotification()

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        width: { xs: 'calc(100% - 40px)', sm: 400 },
        maxWidth: 400,
        maxHeight: '80vh',
        overflowY: 'auto',
        pointerEvents: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#ccc',
          borderRadius: '3px',
          '&:hover': {
            background: '#999',
          },
        },
      }}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </Box>
  )
}
