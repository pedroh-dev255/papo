CREATE DATABASE papo_chat;
use papo_chat;

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
    nome varchar(200) NOT NULL,
    email varchar(200) NOT NULL,
    senha varchar(200) NOT NULL,
    status ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    PRIMARY KEY(id),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (unit_id) REFERENCES unit(id),
    UNIQUE KEY uk_users_tenant_email (tenant_id, email),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

