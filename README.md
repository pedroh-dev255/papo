# 💬 Papo

> **Chat e comunicação corporativa interna 100% On-Premise / Self-Hosted.**

O **Papo** é uma plataforma de comunicação empresarial focada em privacidade, performance e total soberania dos dados. Projetado para rodar inteiramente em infraestrutura própria (servidor local ou VPS), o sistema oferece chat em tempo real, envio de arquivos pesados sem sobrecarga da API e chamadas de áudio corporativas de baixa latência.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend & Desktop App**
* **Electron:** Encapsulamento para aplicativo nativo Desktop (**Windows**, **Linux** e **macOS**).
* **React + Material UI (MUI):** Interface moderna, acessível, responsiva e otimizada para produtividade.

### **Backend & Infraestrutura**
* **Node.js + Express:** API RESTful e servidor de sinalização WebSockets.
* **MySQL 8.0+:** Banco de dados relacional para usuários, mensagens, canais e metadados.
* **Redis:** Cache de alta performance para gerenciamento de sessões, status de presencialidade (*Online/Offline*) e barramento Pub/Sub para WebSockets.
* **MinIO:** Object Storage compatível com AWS S3 para armazenamento local de mídias, vídeos e documentos.
* **LiveKit Server (SFU):** Servidor de mídia *open-source* dedicado para gestão de **chamadas de áudio VoIP** de alta qualidade e baixíssima latência.

---

## 🏗️ Arquitetura do Sistema

```text
                               ┌────────────────────────────────────────────────────────┐
                               │             Infraestrutura Local / VPS                 │
                               │                                                        │
   ┌───────────────────────┐   │   ┌─────────────────────┐    ┌─────────────────────┐   │
   │  App Electron (React) │───┼──►│ Node.js (Express)   │───►│  MySQL              │   │
   │  Windows / Linux / Mac│   │   │ API & WebSockets    │    │  (Dados & Histórico)│   │
   └───────────┬───────────┘   │   └──────────┬──────────┘    └─────────────────────┘   │
               │               │              │                                         │
               │ Presigned     │              ├──────────────►┌─────────────────────┐   │
               │ Uploads       │              │               │  Redis              │   │
               │               │              │               │  (Cache & Pub/Sub)  │   │
               ▼               │              ▼               └─────────────────────┘   │
   ┌───────────────────────┐   │   ┌─────────────────────┐                              │
   │  MinIO                │◄──┼───│  LiveKit (SFU)      │                              │
   │  (Object Storage)     │   │   │  (Chamadas de Áudio)│                              │
   └───────────────────────┘   │   └─────────────────────┘                              │
                               └────────────────────────────────────────────────────────┘

```

### 🎯 Como resolvemos os gargalos de desempenho:

1. **Envio de Arquivos Grandes (Presigned URLs):** O cliente solicita ao backend uma URL de upload pré-assinada e envia o arquivo de mídia **diretamente para o MinIO**. A API e o banco de dados não processam o tráfego de bytes do arquivo, eliminando travamentos no servidor.
2. **Ligações de Áudio com LiveKit:** As chamadas utilizam a arquitetura **SFU (Selective Forwarding Unit)** via WebRTC com o LiveKit, garantindo cancelamento de eco, adaptação dinâmica ao uso de rede e baixíssimo consumo de CPU do servidor principal.

---

## 🚀 Como Rodar o Projeto em Desenvolvimento

### Pré-requisitos

* [Node.js](https://nodejs.org/) (v22 ou superior)
* [Docker](https://www.docker.com/) e **Docker Compose**
* [Git](https://git-scm.com/)

---

### 1. Clonar o repositório

```bash
git clone [https://github.com/pedroh-dev255/papo.git](https://github.com/pedroh-dev255/papo.git)
cd papo

```

---

### 2. Configurar Variáveis de Ambiente (`.env`)

No diretório do servidor (`backend`), crie um arquivo `.env`:

```env
# SERVER
PORT=3000
FRONT_URL=""

# JWT
JWT_SECURITY=super_secret_key
JWT_EXPIRES=15d

# RateLimit
REQ_AUTH_LIMIT=10
REQ_AUTH_TIMEOUT=10

# Sistema de E-mail
MAIL_HOST=
MAIL_USER=
MAIL_PASS=

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=papo_chat

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

# MinIO
MINIO_ENDPOINT=localhost
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=SuaSenhaMuitoForte123!
MINIO_BUCKET=uploads
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_SSL=false

# LiveKit (Chamadas de Áudio)
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secretphrase_must_be_at_least_32_chars

```

*Altere os dados de usuarios, senhas e Secrets, esses dados seram ultilizados pelos container Dockers.*

---

### 3. Subir os serviços de infraestrutura (Docker)

Ultilize o aquivo `docker-compose.yml` na raiz do projeto para iniciar os contêineres:

```bash
docker-compose up -d

```

*Isto iniciará o **MySQL**, **Redis**, **MinIO** e o **LiveKit** em contêineres locais.*

---


### 4. Executar o Backend

```bash
cd backend
npm install
npm run dev

```

---

### 5. Executar o Frontend / Electron

Em outro terminal:

```bash
cd frontend
npm install
npm run dev

```

---

## 📦 Build para Produção (Windows, Linux, macOS)

Para gerar os executáveis instaláveis do aplicativo Desktop:

```bash
cd frontend
#PARA WINDOWS
npm run build:win

#PARA MAC
npm run build:mac

#PARA LINUX
npm run build:mac

```

*Os binários instaláveis (`.exe`, `.AppImage`, `.dmg`) serão gerados na pasta `dist/`.*

---

## 📄 Licença

MIT.

---

### Resumo das escolhas técnicas recomendadas:

1. **Para as Ligações de Áudio: LiveKit Server (SFU)**
   * **Por que foi escolhido?** É atualmente a ferramenta *open-source* mais moderna para WebRTC. Funciona nativamente em contêiner Docker, suporta milhares de salas de áudio simultâneas e consome fração mínima de hardware se comparado ao Asterisk/FreeSWITCH antigo.
2. **Armazenamento:** MinIO lidando com arquivos pesados via *Presigned URLs*.
3. **Cache & Tempo Real:** Redis garantindo que múltiplas instâncias do Express compartilhem conexões WebSocket sem perder mensagens ou o status dos usuários (*Online/Offline*).

---