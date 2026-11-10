# Sistema Barbearia

Sistema completo de gestão para barbearias desenvolvido com arquitetura cliente-servidor (Backend REST API com Node.js/Express e Frontend SPA com React/Vite).

## Tecnologias

### Backend
- **Node.js** com módulos ES (`"type": "module"`)
- **Express 5**
- **Prisma ORM** com PostgreSQL
- **JWT (JSON Web Token)** para autenticação
- **Bcryptjs** para hash seguro de senhas
- **CORS** e **dotenv**

### Frontend
- **React 19**
- **Vite**
- **Fetch API** integrada para comunicação com o backend

---

## Estrutura do Projeto

```
sistema-barbearia/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   ├── agendamento.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── cliente.controller.js
│   │   │   ├── profissional.controller.js
│   │   │   └── servico.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── agendamento.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── cliente.routes.js
│   │   │   ├── profissional.routes.js
│   │   │   ├── servico.routes.js
│   │   │   └── index.js
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── prisma.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CadastroSimples.jsx
│   │   ├── pages/
│   │   │   ├── Agendamentos.jsx
│   │   │   ├── Clientes.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profissionais.jsx
│   │   │   └── Servicos.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── der.png
└── README.md
```

---

## Como Executar

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

O servidor iniciará em `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará acessível na URL indicada pelo Vite (geralmente `http://localhost:5173`).
