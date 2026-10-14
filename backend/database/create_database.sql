-- Estrutura para instalações NOVAS. Não altera tabelas que já existem.
-- Não contém usuários de exemplo nem senhas em texto simples.
-- Para instalações existentes, verifique as colunas e faça migrações com backup.
CREATE DATABASE IF NOT EXISTS agrorisk
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrorisk;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NULL,
  cpf VARCHAR(14) NULL,
  data_nascimento DATE NULL,
  estado VARCHAR(100) NULL,
  cidade VARCHAR(100) NULL,
  idioma VARCHAR(50) NULL DEFAULT 'Português'
);

CREATE TABLE IF NOT EXISTS propriedades (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(100) NOT NULL,
  observacao TEXT NULL,
  area FLOAT NOT NULL,
  perimetro FLOAT NOT NULL DEFAULT 0,
  latitude FLOAT NULL,
  longitude FLOAT NULL,
  geojson TEXT NULL,
  CONSTRAINT fk_prop_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS safras (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  propriedade_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  cultura VARCHAR(100) NOT NULL,
  ano_safra VARCHAR(20) NOT NULL,
  area_plantada DECIMAL(10,2) NOT NULL,
  data_plantio DATE NULL,
  data_colheita DATE NULL,
  produtividade DECIMAL(10,2) NULL,
  custo_total DECIMAL(10,2) NULL,
  observacoes TEXT NULL,
  status VARCHAR(50) NULL DEFAULT 'Planejamento',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_safra_prop FOREIGN KEY (propriedade_id) REFERENCES propriedades(id)
);
