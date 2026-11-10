# ✂ SAEP Barbearia

Sistema de gestão para barbearias desenvolvido com **Node.js + Express + SQLite**.

## Tecnologias

| Camada       | Tecnologia                                     |
|--------------|------------------------------------------------|
| Servidor     | Node.js 22+ · Express 4                        |
| Banco de dados | SQLite via `node:sqlite` (built-in do Node.js) |
| Templates    | Nunjucks (HTML server-side rendering)          |
| Sessão       | express-session                                |
| Criptografia | AES-256-GCM nativo (`node:crypto`)             |
| Hash de senha| bcryptjs                                       |

## Funcionalidades

- 🔐 **Login com sessão** (expira em 30 minutos)
- 👤 **Clientes** — cadastro com CPF criptografado (LGPD)
- 💈 **Barbeiros** — cadastro com CPF e senha criptografados (LGPD)
- ✂ **Serviços** — nome, preço e duração
- 📅 **Agendamentos** — com verificação de conflito de horário

## Estrutura do projeto

```
sistema-barbearia/
├── servidor/
│   ├── app.js          # Servidor Express + rotas
│   ├── config.js       # Configurações (env vars)
│   ├── crypto.js       # Criptografia AES-256-GCM
│   ├── db.js           # Conexão SQLite
│   ├── static/
│   │   └── style.css   # Estilos
│   └── templates/      # Templates Nunjucks (HTML)
│       ├── base.html
│       ├── login.html
│       ├── painel.html
│       ├── clientes.html
│       ├── barbeiros.html
│       ├── servicos.html
│       └── agendamentos.html
├── scripts/
│   └── gerar_seed.js   # Popula o banco com dados de teste
├── docs/
│   ├── der.mmd         # Diagrama ER (Mermaid)
│   ├── der.png
│   └── documentacao.md
├── saep_db.sql         # Script SQL de criação do banco
└── package.json
```

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) **v22.5 ou superior**

### Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Gerar o banco de dados com dados de teste
node scripts/gerar_seed.js

# 3. Iniciar o servidor
npm start
```

Acesse em: **http://localhost:3000**

### Logins de teste

| Usuário  | Senha       |
|----------|-------------|
| ana      | ana123      |
| carlos   | carlos123   |
| juliana  | juliana123  |

## Variáveis de ambiente

| Variável      | Padrão              | Descrição                        |
|---------------|---------------------|----------------------------------|
| `SAEP_SECRET` | `troque-esta-chave` | Chave da sessão Express          |
| `SAEP_CHAVE`  | (chave demo)        | Chave AES para criptografar CPFs |
| `SAEP_DB`     | `./saep.db`         | Caminho do arquivo SQLite        |
| `PORT`        | `3000`              | Porta do servidor                |

> [!CAUTION]
> Em produção, sempre defina `SAEP_SECRET` e `SAEP_CHAVE` com valores seguros via variáveis de ambiente.
