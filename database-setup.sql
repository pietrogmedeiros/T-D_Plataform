-- Criar banco de dados
CREATE DATABASE td_platform;

-- Conectar ao banco de dados
\c td_platform;

-- Criar extensão para UUIDs (caso não exista)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- As tabelas serão criadas automaticamente pelo Prisma Migrate
