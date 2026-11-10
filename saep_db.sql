
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS agendamento;
DROP TABLE IF EXISTS servico;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS barbeiro;
DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL,
    login       TEXT    NOT NULL UNIQUE,
    senha_hash  TEXT    NOT NULL           
);

CREATE TABLE barbeiro (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome                  TEXT    NOT NULL,
    telefone              TEXT,
    cpf_criptografado     TEXT    NOT NULL,  
    senha_criptografada   TEXT    NOT NULL   
);

CREATE TABLE cliente (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome                  TEXT    NOT NULL,
    telefone              TEXT,
    cpf_criptografado     TEXT    NOT NULL   
);

CREATE TABLE servico (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT    NOT NULL,
    preco         REAL    NOT NULL CHECK (preco >= 0),
    duracao_min   INTEGER NOT NULL CHECK (duracao_min > 0)
);

CREATE TABLE agendamento (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id    INTEGER NOT NULL REFERENCES cliente(id),
    barbeiro_id   INTEGER NOT NULL REFERENCES barbeiro(id),
    servico_id    INTEGER NOT NULL REFERENCES servico(id),
    data          TEXT    NOT NULL,           
    hora          TEXT    NOT NULL,           
    status        TEXT    NOT NULL DEFAULT 'marcado',
    UNIQUE (barbeiro_id, data, hora)          
);


INSERT INTO usuario (id, nome, login, senha_hash) VALUES (1, 'Ana Souza', 'ana', 'scrypt:32768:8:1$Dn45hA3xOKT5p8yD$01215f2b4f7860905cab45ecf92b9bbf7c1f0596acbb7dfc15a7c70677c44a3c965c66a50c42103003a699143b8319e1a2d2fe01069af6442f5abb8e6d8611f6');
INSERT INTO usuario (id, nome, login, senha_hash) VALUES (2, 'Carlos Lima', 'carlos', 'scrypt:32768:8:1$MjemEpdGfXTjlkBM$78bcaa1fe13f9b555dbffc84dc311160ab598d0ce82b42a3a80b8cdc90deec7d13927f02b66985b62e6ae535e10f1e2fe688bb04beef00a2dab55e77ece6bb78');
INSERT INTO usuario (id, nome, login, senha_hash) VALUES (3, 'Juliana Melo', 'juliana', 'scrypt:32768:8:1$aFnjtaHLK7IIoAAy$1dbf5e9d8c417d7a8a36b6b0b2e9b3753437115c807823e325c0798216032aaa2617b2c63dbb7c73a42794ffcd5bd36e01cbac3e55e794d24a2464f1492c5099');


INSERT INTO barbeiro (id, nome, telefone, cpf_criptografado, senha_criptografada) VALUES (1, 'Rafael Costa', '(11) 98888-1111', 'gAAAAABq8vTRLzaL88MnuzU-Rg0Qc8JGlr1NqQuROphErdpI9EpkYpTGIhnsWw0EwrFEu60XHYaOIvasyk5IQ5rVSWg-uNnn0A==', 'gAAAAABq8vTRwcq7ClT80ipQpADxY9ptyLCrBVqTfsdTrV0H1vvpeqNeBk5AFBDqnCL6bk6FPUTQHD8VzUDDy3B-GO1GvUOvyw==');
INSERT INTO barbeiro (id, nome, telefone, cpf_criptografado, senha_criptografada) VALUES (2, 'Bruno Alves', '(11) 98888-2222', 'gAAAAABq8vTRvHjPPF_OjapqKy6njC3W23uY9prr6my9nuRxpjH9bGjj2BBWGi_0OsSwGz3s_z-cL1Gxz78YyfmRZpC1KAHU9Q==', 'gAAAAABq8vTRzZRAHFQOm0iatsXxIBC1dk4toJT4wkRH-rJlXGgi-syTWPLiSj53aqymZ6U7UF_xBmboTo20wppv0rsPhTlXfA==');
INSERT INTO barbeiro (id, nome, telefone, cpf_criptografado, senha_criptografada) VALUES (3, 'Diego Nunes', '(11) 98888-3333', 'gAAAAABq8vTRLo5oUDVGF0zrQNnU0Ij2v46vQIfOmokljm8y2G29TIb_SBodCCUGx8Soub2n8K4Uh9Z_PlXBOYi8EGomCqi7hg==', 'gAAAAABq8vTRygh3zI4HkJlRFe_4ucg9Vk5WaVW7XolM2abRO15AuJQ0Yx2aXmJTXlNpumL3DQeC2CWxASZj_xyuLM0TX-rnyA==');


INSERT INTO cliente (id, nome, telefone, cpf_criptografado) VALUES (1, 'Marcos Pereira', '(11) 97777-1111', 'gAAAAABq8vTRKY6ivlJxg9pYEabLBvaWFDTQ4Z8t-4W2nhwvUe7CAVa1DscdBqzACnLKAx1TAYEJStyS3x2e7zDPahIgE5Io2A==');
INSERT INTO cliente (id, nome, telefone, cpf_criptografado) VALUES (2, 'Lucas Ferreira', '(11) 97777-2222', 'gAAAAABq8vTRkmm_Dd3Tq91ZFM0QyroOkPXo-0QczeHsGXdXeSXJyl4cQxVFdcw5A1h8IA45EpgKw-APZqLEcFGIt0FYZTmELg==');
INSERT INTO cliente (id, nome, telefone, cpf_criptografado) VALUES (3, 'Pedro Oliveira', '(11) 97777-3333', 'gAAAAABq8vTRSPKfS1N9qDkgdu9TWHTfrtp5DPcsFyWOyrDzs_9maNJ2fzon-9Dx1Rr5AxwsdqxXRpuG1E1n7bZmXb8lRw1MWQ==');


INSERT INTO servico (id, nome, preco, duracao_min) VALUES (1, 'Corte masculino', 45.00, 30);
INSERT INTO servico (id, nome, preco, duracao_min) VALUES (2, 'Barba completa', 35.00, 20);
INSERT INTO servico (id, nome, preco, duracao_min) VALUES (3, 'Corte + barba', 70.00, 50);


INSERT INTO agendamento (id, cliente_id, barbeiro_id, servico_id, data, hora, status) VALUES (1, 1, 1, 3, '2026-11-10', '09:00', 'marcado');
INSERT INTO agendamento (id, cliente_id, barbeiro_id, servico_id, data, hora, status) VALUES (2, 2, 2, 1, '2026-11-10', '10:00', 'marcado');
INSERT INTO agendamento (id, cliente_id, barbeiro_id, servico_id, data, hora, status) VALUES (3, 3, 3, 2, '2026-11-11', '14:30', 'marcado');
