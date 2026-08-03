import { createContext, useContext, useCallback, useEffect } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  // Detecta se estamos em ambiente Electron
  const isElectron = () => {
    return typeof window !== 'undefined' && window.electron?.ipcRenderer
  }

  const addNotification = useCallback((config) => {
    const { title, body, avatar, type = 'info' } = config

    // Mostrar notificação do sistema se em Electron
    if (isElectron()) {
      try {
        // Converter urgência baseado no tipo
        const urgencyMap = {
          info: 'normal',
          success: 'normal',
          warning: 'normal',
          error: 'critical',
        }

        window.electron.ipcRenderer.send('notification:show', {
          title,
          body: typeof body === 'string' ? body : 'Você tem uma nova notificação',
          urgency: urgencyMap[type] || 'normal',
          icon: avatar, // Pode ser undefined
        })
      } catch (error) {
        console.error('Erro ao enviar notificação do sistema:', error)
      }
    } else {
      // Fallback para web: usar console
      console.log(`[${type.toUpperCase()}] ${title}: ${body}`)
    }

    return null
  }, [])

  // Escutar cliques em notificações do sistema
  useEffect(() => {
    if (!isElectron()) return

    try {
      const handleNotificationClick = (config) => {
        console.log('Notificação do sistema clicada:', config)
      }

      window.electron.ipcRenderer.on(
        'notification:clicked',
        handleNotificationClick
      )

      return () => {
        window.electron.ipcRenderer.removeListener(
          'notification:clicked',
          handleNotificationClick
        )
      }
    } catch (error) {
      console.error('Erro ao configurar listener de notificação:', error)
    }
  }, [])

  const value = {
    addNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification deve ser usado dentro de um NotificationProvider'
    )
  }
  return context
}
