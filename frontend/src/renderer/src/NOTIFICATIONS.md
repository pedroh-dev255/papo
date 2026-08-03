# Sistema de Notificações

O sistema de notificações permite exibir mensagens em dois lugares:
1. **Notificações do Sistema** (Windows/Mac/Linux) - Aparecem independentemente da janela do app
2. **Notificações da UI** (In-app) - Aparecem no canto superior direito da aplicação

## Características

- ✅ **Notificações nativas do SO**: Aparecem como toast/pop-up do Windows, Mac ou Linux
- ✅ **Notificações in-app**: Aparecem também na UI para feedback imediato
- ✅ **4 tipos de notificação**: `info`, `success`, `warning`, `error`
- ✅ **Suporte a avatares**: Exibir avatar do usuário ou ícone padrão
- ✅ **Body flexível**: Texto simples, JSX customizado, imagens ou GIFs
- ✅ **Ações customizadas**: Botão de ação opcional com callback
- ✅ **Auto-dismiss**: Desaparece automaticamente após duração definida
- ✅ **Stack de notificações**: Múltiplas notificações aparecem empilhadas
- ✅ **Clique em notificação do SO**: Foca a janela quando clicado

## Uso Básico

### 1. Use o hook `useNotification()` em qualquer componente:

```jsx
import { useNotification } from '../contexts/NotificationContext'

export default function MeuComponente() {
  const { addNotification } = useNotification()

  const handleClick = () => {
    addNotification({
      type: 'success',
      title: 'Sucesso!',
      body: 'Operação concluída com sucesso.',
    })
    // Isso mostrará:
    // 1. Uma notificação nativa do SO (Windows/Mac/Linux)
    // 2. Uma notificação in-app no canto superior direito
  }

  return <button onClick={handleClick}>Mostrar Notificação</button>
}
```

**Resultado:**
- ✅ Notificação do SO aparece no canto da tela (independente da janela)
- ✅ Notificação in-app aparece no app (com ícone e estilos customizados)
- ✅ Ao clicar na notificação do SO, a janela do app ganha foco

## API Completa

### `addNotification(config)`

Exibe uma notificação. Retorna o ID da notificação.

#### Parâmetros:

```javascript
{
  title: string,           // OBRIGATÓRIO: Título da notificação
  body: string | JSX,      // OBRIGATÓRIO: Conteúdo (texto, imagem, elemento React)
  avatar?: string,         // URL da imagem do avatar (opcional)
  type?: 'info' | 'success' | 'warning' | 'error',  // Tipo (padrão: 'info')
  duration?: number,       // Tempo até desaparecer em ms (padrão: 5000, 0 = permanente)
  action?: {               // Ação/botão opcional
    label: string,         // Texto do botão
    onClick: () => void    // Função executada ao clicar
  }
}
```

## Exemplos

### Notificação Simples

```jsx
addNotification({
  type: 'success',
  title: 'Login realizado',
  body: 'Bem-vindo ao Papo Chat!',
  duration: 3000,
})
```

### Com Avatar

```jsx
addNotification({
  type: 'info',
  title: 'Nova mensagem',
  body: 'João Silva: Olá, como vai?',
  avatar: 'https://i.pravatar.cc/150?img=5',
  duration: 5000,
})
```

### Com Ação (Não desaparece automaticamente)

```jsx
addNotification({
  type: 'warning',
  title: 'Confirmação necessária',
  body: 'Deseja sair da conversa?',
  duration: 0, // Permanente até o usuário interagir
  action: {
    label: 'Confirmar',
    onClick: () => {
      console.log('Saiu da conversa')
      // sua lógica aqui
    }
  }
})
```

### Com Imagem/GIF

```jsx
addNotification({
  type: 'info',
  title: 'Imagem compartilhada',
  body: (
    <img
      src="https://via.placeholder.com/300x200"
      alt="Imagem"
      style={{ width: '100%', borderRadius: '4px', marginTop: '8px' }}
    />
  ),
  avatar: user?.avatar,
  duration: 5000,
})
```

### Com HTML Customizado

```jsx
import { Box, Typography, Link } from '@mui/material'

addNotification({
  type: 'info',
  title: 'Atualização disponível',
  body: (
    <Box>
      <Typography variant="body2">Uma nova versão está disponível.</Typography>
      <Link href="#" sx={{ mt: 1 }}>
        Ver detalhes
      </Link>
    </Box>
  ),
  duration: 0, // Permanente
})
```

### Notificação com Múltiplas Linhas

```jsx
addNotification({
  type: 'error',
  title: 'Erro na operação',
  body: `Motivo: Conexão perdida
Tente novamente em alguns instantes`,
  duration: 5000,
})
```

## Tipos de Notificação

### Info (Azul)
```jsx
addNotification({
  type: 'info',
  title: 'Informação',
  body: 'Conteúdo informativo',
})
```

### Success (Verde)
```jsx
addNotification({
  type: 'success',
  title: 'Sucesso',
  body: 'Operação concluída',
})
```

### Warning (Laranja)
```jsx
addNotification({
  type: 'warning',
  title: 'Aviso',
  body: 'Cuidado com esta ação',
})
```

### Error (Vermelho)
```jsx
addNotification({
  type: 'error',
  title: 'Erro',
  body: 'Algo deu errado',
})
```

## Métodos Adicionais

### Remover Notificação Específica

```jsx
const { removeNotification } = useNotification()

const notificationId = addNotification({...})
// Depois, remover manualmente:
removeNotification(notificationId)
```

### Limpar Todas as Notificações

```jsx
const { clearAll } = useNotification()
clearAll()
```

### Acessar Lista de Notificações

```jsx
const { notifications } = useNotification()
console.log(notifications) // Array de notificações ativas
```

## Integração com Backend

### Via IPC (Electron)

```javascript
// No main/index.js (processo principal)
ipcMain.on('notification:send', (event, config) => {
  // Enviar para o renderer
  event.sender.send('notification:received', config)
})

// No renderer (React)
window.electron.ipcRenderer.on('notification:received', (config) => {
  addNotification(config)
})
```

### Via WebSocket

```jsx
useEffect(() => {
  socket.on('notification', (data) => {
    addNotification({
      type: data.type || 'info',
      title: data.title,
      body: data.body,
      avatar: data.avatar,
    })
  })
}, [addNotification])
```

## Notificações Nativas do Sistema Operacional

As notificações aparecem automaticamente no sistema operacional **sem qualquer configuração extra**.

### Como Funciona

1. **Você chama** `addNotification()` no seu código
2. **Automático**: Uma notificação nativa é enviada via IPC para o processo principal do Electron
3. **Resultado**: Notificação aparece no SO (Windows/Mac/Linux) + na UI

```javascript
// Tudo feito automaticamente!
addNotification({
  type: 'success',
  title: 'Mensagem recebida',
  body: 'João Silva acabou de enviar uma mensagem',
  avatar: 'https://i.pravatar.cc/150?img=5',
})
// ↓
// ✅ Notificação do SO (independente da janela)
// ✅ Notificação in-app (no canto da tela)
// ✅ Clique na notificação do SO → foca a janela
```

### Diferenças por Plataforma

| Plataforma | Comportamento |
|-----------|-----|
| **Windows** | Aparece no Action Center (canto inferior direito) |
| **macOS** | Aparece no Notification Center (canto superior direito) |
| **Linux** | Via D-Bus (sistema de notificações nativo) |

### Configuração de Urgência Automática

A urgência da notificação é definida automaticamente por tipo:
- `info` → `normal`
- `success` → `normal`
- `warning` → `normal`
- `error` → `critical` (mais visível)

### Customização Avançada

Para modificar o comportamento das notificações do SO, edite `src/main/index.js`:

```javascript
ipcMain.on('notification:show', (event, config) => {
  const notification = new Notification({
    title: config.title,
    body: config.body,
    icon: config.icon,
    urgency: config.urgency,
    silent: false, // Mude para true para desabilitar som
    // ... outras opções
  })
  notification.show()
})
```

O NotificationCenter está posicionado no canto superior direito (`top: 20px, right: 20px`).
Para alterar, edite `src/renderer/src/components/NotificationCenter.jsx` na propriedade `sx` do Box raiz.

## Temas

Os ícones e cores são automaticamente definidos por tipo:
- **info**: Azul (#2196F3)
- **success**: Verde (#4CAF50)
- **warning**: Laranja (#FF9800)
- **error**: Vermelho (#F44336)

Para customizar cores, edite `typeConfig` em `NotificationCenter.jsx`.

## Estrutura de Diretórios

```
src/renderer/src/
├── contexts/
│   └── NotificationContext.jsx    # Contexto e hook useNotification()
├── components/
│   └── NotificationCenter.jsx     # Componente que exibe notificações
└── pages/
    └── Home.jsx                   # Exemplo de uso
```

## Performance

- Notificações são mantidas em memória
- Auto-limpeza com `setTimeout` quando `duration` > 0
- Máximo de 10 notificações simultâneas recomendado
- Notificações do SO são gerenciadas pelo Electron (muito leve)

## Próximos Passos

- Integrar com eventos do servidor (WebSocket)
- Suporte a som customizado nas notificações
- Persistência de histórico de notificações
- Categorias de notificação (silenciar certos tipos)
