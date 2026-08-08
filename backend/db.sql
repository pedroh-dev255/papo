CREATE DATABASE papo_chat;
use papo_chat;

SET GLOBAL time_zone = '-03:00';
SET SESSION time_zone = '-03:00';

CREATE TABLE tenant(
    id int not null AUTO_INCREMENT,
    codigo CHAR(8) NOT NULL UNIQUE,
    nome VARCHAR(200) not null,
    descricao text,
    cpf varchar(14),
    cnpj varchar(18),
    status ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    PRIMARY KEY(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE unit(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,
    nome varchar(200) NOT NULL,
    descricao text,
    codigo varchar(50),
    cidade varchar(200),
    estado varchar(200),
    ativo ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,
    unit_id int not null,
    avatar varchar(500),
    nome varchar(200) NOT NULL,
    email varchar(200) NOT NULL,
    telefone VARCHAR(30),
    ramal VARCHAR(20),
    senha varchar(200) NOT NULL,
    status ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    ultimo_acesso TIMESTAMP NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (unit_id) REFERENCES unit(id),
    UNIQUE KEY uk_users_tenant_email (tenant_id, email),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE chat(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,

    last_message_id int,
    type ENUM("grupo", "privado", "lista-transmissao") not null,
    owner int,
    
    nome VARCHAR(200),
    descricao text,
    avatar varchar(500),

    deleted_at TIMESTAMP NULL,

    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (owner) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE chat
ADD COLUMN private_key VARCHAR(100) NULL,
ADD UNIQUE KEY uk_chat_private_key (tenant_id, private_key);

CREATE TABLE chat_participantes(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,

    chat_id int not null,
    user_id int not null,

    role ENUM( 'owner', 'admin', 'membro' ) DEFAULT 'membro',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,

    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    FOREIGN KEY (user_id) REFERENCES users(id),

    UNIQUE(chat_id, user_id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE chat_configuracao_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tenant_id INT NOT NULL,
    chat_id INT NOT NULL,
    user_id INT NOT NULL,

    silenciado_ate TIMESTAMP NULL,
    fixado BOOLEAN DEFAULT FALSE,

    UNIQUE(chat_id, user_id),

    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE chamada(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,
    chat_id int not null,

    owner_id int,
    duracao INT,

    type ENUM("voz", "video"),
    status ENUM('aguardando', 'tocando', 'em_andamento', 'encerrada', 'cancelada') DEFAULT 'aguardando',
    end_at TIMESTAMP,

    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE chamada_participantes(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,
    chamada_id int not null,

    user_id int not null,
    status ENUM('pendente', 'tocando', 'atendeu', 'recusado', 'saiu'),

    UNIQUE(chamada_id, user_id),
    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (chamada_id) REFERENCES chamada(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE mensagens(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,

    chat_id int not null,
    sender_id int not null,
    type ENUM("texto", "audio", "imagem", "video", "sistema", "arquivo") not null,
    
    texto text,
    device VARCHAR(100),

    reply_to INT NULL,
    edited_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (reply_to) REFERENCES mensagens(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE mensagem_arquivo(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,
    mensagem_id int not null,

    nome_original VARCHAR(255),
    mime_type VARCHAR(100),
    storage_key varchar(500) not null,
    tamanho BIGINT,
    thumbnail_key VARCHAR(500),
    duracao INT,

    deleted_at TIMESTAMP NULL,

    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id)
);

CREATE TABLE mensagem_leitura(
    id int not null AUTO_INCREMENT,
    tenant_id int not null,
    mensagem_id int not null,
    user_id int not null,
    lido_em TIMESTAMP,

    UNIQUE(mensagem_id, user_id),

    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE mensagem_reacao(
    id INT AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    mensagem_id INT NOT NULL,
    user_id INT NOT NULL,

    emoji VARCHAR(20),

    PRIMARY KEY(id),
    UNIQUE(mensagem_id,user_id,emoji),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (mensagem_id) REFERENCES mensagens(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);



CREATE INDEX idx_chat_tenant
ON chat(tenant_id);

CREATE INDEX idx_chat_updated
ON chat(updated_at);

CREATE INDEX idx_msg_chat
ON mensagens(chat_id);

CREATE INDEX idx_msg_chat_created
ON mensagens(chat_id, created_at);

CREATE INDEX idx_msg_sender
ON mensagens(sender_id);

CREATE INDEX idx_participante_chat
ON chat_participantes(chat_id);

CREATE INDEX idx_participante_user
ON chat_participantes(user_id);

CREATE INDEX idx_reacao_msg
ON mensagem_reacao(mensagem_id);

CREATE INDEX idx_leitura_msg
ON mensagem_leitura(mensagem_id);

CREATE INDEX idx_reply
ON mensagens(reply_to);

CREATE INDEX idx_deleted
ON mensagens(deleted_at);

CREATE INDEX idx_chat_deleted
ON chat(deleted_at);

CREATE INDEX idx_chamada_owner
ON chamada(owner_id);

CREATE INDEX idx_chamada_participante
ON chamada_participantes(chamada_id);

CREATE INDEX idx_chamada_chat
ON chamada(chat_id);

CREATE INDEX idx_chamada_status
ON chamada(status);

CREATE INDEX idx_chamada_created
ON chamada(created_at);

CREATE INDEX idx_users_unit
ON users(unit_id);

CREATE INDEX idx_users_status
ON users(status);

CREATE INDEX idx_arquivo_msg
ON mensagem_arquivo(mensagem_id);

CREATE INDEX idx_leitura_user_msg
ON mensagem_leitura(user_id, mensagem_id);