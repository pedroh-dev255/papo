# Integração de Autenticação com Electron

## Estrutura Implementada

O sistema de autenticação foi implementado com:

1. **AuthContext** (`src/renderer/src/contexts/AuthContext.jsx`)
   - Gerencia estado global de autenticação
   - Métodos: `login()`, `logout()`
   - Props: `user`, `isAuthenticated`, `loading`

2. **AuthGuard** (`src/renderer/src/components/AuthGuard.jsx`)
   - Protege rotas privadas
   - Redireciona não-autenticados para `/login`
   - Exibe loading enquanto verifica autenticação

3. **Rotas** (`src/renderer/src/routes/AppRoutes.jsx`)
   - `/login` - Página de login (pública)
   - `/` - Home/Chat (protegida por AuthGuard)

## Fluxo Atual (Desenvolvimento/Demo)

Atualmente, o login simula uma autenticação com delay de 1500ms e gera dados dummy.

Para testar:
- Email: qualquer email válido (ex: `teste@email.com`)
- Senha: qualquer coisa com 6+ caracteres

## Integrando com Backend Real

### Opção 1: Via IPC do Electron (Recomendado)

Se você tem um backend Node.js no processo principal do Electron:

**No Backend (main/index.js):**
```javascript
ipcMain.handle('auth:login', async (event, credentials) => {
  try {
    // Sua lógica de autenticação aqui
    const response = await fetch('http://seu-backend/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) throw new Error('Credenciais inválidas')

    const data = await response.json()
    return { success: true, token: data.token, user: data.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('auth:logout', async (event) => {
  // Limpar sessão, invalidar token, etc
  return { success: true }
})
```

**No Frontend (pages/login.jsx):**
```javascript
const onSubmit = async (data) => {
  setLoading(true);
  try {
    // Chamar o backend via IPC
    const result = await window.electron.ipcRenderer.invoke('auth:login', data)

    if (!result.success) {
      throw new Error(result.error || 'Erro ao fazer login')
    }

    // Usar o contexto de autenticação
    login(result.user, result.token)

    toast.success('Login realizado com sucesso!')
    navigate('/', { replace: true })
  } catch (error) {
    toast.error(error.message)
    console.error('Login error:', error)
  } finally {
    setLoading(false)
  }
}
```

### Opção 2: Via API HTTP (Se backend separado)

**No Frontend (pages/login.jsx):**
```javascript
const onSubmit = async (data) => {
  setLoading(true);
  try {
    const response = await fetch('http://seu-backend/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Credenciais inválidas')
    }

    const result = await response.json()

    // Usar o contexto de autenticação
    login(result.user, result.token)

    toast.success('Login realizado com sucesso!')
    navigate('/', { replace: true })
  } catch (error) {
    toast.error(error.message)
    console.error('Login error:', error)
  } finally {
    setLoading(false)
  }
}
```

## Usando a Autenticação nos Componentes

Em qualquer componente, use o hook `useAuth()`:

```javascript
import { useAuth } from '../contexts/AuthContext'

export default function MeuComponente() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div>
      {isAuthenticated && (
        <>
          <p>Olá, {user.name}</p>
          <button onClick={logout}>Sair</button>
        </>
      )}
    </div>
  )
}
```

## Fluxo de Logout

O logout pode ser chamado em qualquer lugar:

```javascript
const handleLogout = () => {
  logout()
  navigate('/login', { replace: true })
}
```

A sessão é persistida em `localStorage`, então o usuário mantém a autenticação ao recarregar a página.

## Estrutura de Diretórios

```
src/renderer/src/
├── contexts/
│   └── AuthContext.jsx          # Contexto de autenticação
├── components/
│   └── AuthGuard.jsx             # Proteção de rotas
├── routes/
│   └── AppRoutes.jsx             # Definição de rotas
├── pages/
│   ├── login.jsx                 # Página de login
│   └── Home.jsx                  # Página inicial/chat
├── App.jsx                       # Componente principal
└── main.jsx                      # Entry point com providers
```

## Próximos Passos

1. Implementar API real de autenticação
2. Substituir dados dummy por dados reais da API
3. Adicionar validação de token no backend
4. Implementar refresh token para manter sessão ativa
5. Adicionar recuperação de senha
6. Adicionar registro de novo usuário
