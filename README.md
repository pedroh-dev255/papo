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