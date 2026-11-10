/**
 * app.js — SAEP Barbearia (Node.js + Express + Nunjucks + SQLite)
 *
 * Equivalente completo do app.py original em Python/Flask.
 */

'use strict';

const path       = require('path');
const express    = require('express');
const session    = require('express-session');
const nunjucks   = require('nunjucks');
const bcrypt     = require('bcryptjs');
const bodyParser = require('body-parser');

const config             = require('./config');
const { getDb }          = require('./db');
const { cifrar, decifrar, mascarar_cpf } = require('./crypto');

const app = express();

// ---------------------------------------------------------------- view engine
const env = nunjucks.configure(path.join(__dirname, 'templates'), {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV !== 'production',
});
// Filtro equivalente ao "%.2f"|format do Jinja2
env.addFilter('toFixed', (num, casas = 2) => Number(num).toFixed(casas));
app.set('view engine', 'html');

// ---------------------------------------------------------------- middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(session({
  secret: config.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: config.SESSION_MINUTOS * 60 * 1000,
  },
}));

// ---------------------------------------------------------------- utilitários

function somente_digitos(texto) {
  return (texto || '').replace(/\D/g, '');
}

function com_cpf_mascarado(linhas) {
  return linhas.map(l => ({
    id:       l.id,
    nome:     l.nome,
    telefone: l.telefone,
    cpf:      mascarar_cpf(decifrar(l.cpf_criptografado)),
  }));
}

/** Injeta flash e session em todos os templates */
app.use((req, _res, next) => {
  if (!req.session.flash) req.session.flash = [];
  next();
});

function flash(req, categoria, msg) {
  if (!req.session.flash) req.session.flash = [];
  req.session.flash.push({ categoria, msg });
}

function getFlash(req) {
  const msgs = req.session.flash || [];
  req.session.flash = [];
  return msgs;
}

/** Variáveis globais disponíveis em todos os templates */
app.use((req, res, next) => {
  res.locals.session   = req.session;
  res.locals.mensagens = getFlash(req);
  next();
});

/** Middleware de autenticação */
function loginObrigatorio(req, res, next) {
  if (!req.session.usuario_id) {
    flash(req, 'erro', 'Sessão expirada ou inexistente. Faça login novamente.');
    return res.redirect('/login');
  }
  next();
}

// ---------------------------------------------------------------- rotas: raiz

app.get('/', (req, res) => {
  res.redirect(req.session.usuario_id ? '/painel' : '/login');
});

// ---------------------------------------------------------------- rotas: login

app.get('/login', (req, res) => {
  res.render('login.html');
});

app.post('/login', async (req, res) => {
  const login_digitado = (req.body.login || '').trim();
  const senha          = req.body.senha  || '';

  const db      = getDb();
  const usuario = db.prepare(
    'SELECT id, nome, senha_hash FROM usuario WHERE login = ?'
  ).get(login_digitado);

  // mensagem genérica: não revela se foi o usuário ou a senha que errou
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    flash(req, 'erro', 'Usuário ou senha inválidos.');
    return res.status(401).render('login.html');
  }

  req.session.regenerate(() => {
    req.session.usuario_id = usuario.id;
    req.session.nome       = usuario.nome;
    req.session.flash      = [];
    res.redirect('/painel');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ---------------------------------------------------------------- rotas: painel

app.get('/painel', loginObrigatorio, (req, res) => {
  const db = getDb();
  const contagens = {};
  for (const tabela of ['cliente', 'barbeiro', 'servico', 'agendamento']) {
    contagens[tabela] = db.prepare(`SELECT COUNT(*) as n FROM ${tabela}`).get().n;
  }
  res.render('painel.html', { contagens });
});

// ---------------------------------------------------------------- rotas: clientes

app.get('/clientes', loginObrigatorio, (req, res) => {
  const db    = getDb();
  const busca = (req.query.busca || '').trim();
  const linhas = db.prepare(
    'SELECT id, nome, telefone, cpf_criptografado FROM cliente WHERE nome LIKE ? ORDER BY nome'
  ).all(`%${busca}%`);
  res.render('clientes.html', { clientes: com_cpf_mascarado(linhas), busca });
});

app.post('/clientes', loginObrigatorio, (req, res) => {
  const nome     = (req.body.nome     || '').trim();
  const telefone = (req.body.telefone || '').trim();
  const cpf      = somente_digitos(req.body.cpf);

  if (!nome || cpf.length !== 11) {
    flash(req, 'erro', 'Informe o nome e um CPF com 11 dígitos.');
  } else {
    getDb().prepare(
      'INSERT INTO cliente (nome, telefone, cpf_criptografado) VALUES (?, ?, ?)'
    ).run(nome, telefone, cifrar(cpf));
    flash(req, 'ok', 'Cliente cadastrado.');
  }
  res.redirect('/clientes');
});

// ---------------------------------------------------------------- rotas: barbeiros

app.get('/barbeiros', loginObrigatorio, (req, res) => {
  const linhas = getDb().prepare(
    'SELECT id, nome, telefone, cpf_criptografado FROM barbeiro ORDER BY nome'
  ).all();
  res.render('barbeiros.html', { barbeiros: com_cpf_mascarado(linhas) });
});

app.post('/barbeiros', loginObrigatorio, (req, res) => {
  const nome     = (req.body.nome     || '').trim();
  const telefone = (req.body.telefone || '').trim();
  const cpf      = somente_digitos(req.body.cpf);
  const senha    = req.body.senha || '';

  if (!nome || cpf.length !== 11 || senha.length < 6) {
    flash(req, 'erro', 'Informe o nome, um CPF com 11 dígitos e uma senha de 6+ caracteres.');
  } else {
    getDb().prepare(
      'INSERT INTO barbeiro (nome, telefone, cpf_criptografado, senha_criptografada) VALUES (?, ?, ?, ?)'
    ).run(nome, telefone, cifrar(cpf), cifrar(senha));
    flash(req, 'ok', 'Barbeiro cadastrado.');
  }
  res.redirect('/barbeiros');
});

// ---------------------------------------------------------------- rotas: serviços

app.get('/servicos', loginObrigatorio, (req, res) => {
  const lista = getDb().prepare(
    'SELECT id, nome, preco, duracao_min FROM servico ORDER BY nome'
  ).all();
  res.render('servicos.html', { servicos: lista });
});

app.post('/servicos', loginObrigatorio, (req, res) => {
  const nome = (req.body.nome || '').trim();
  const preco   = parseFloat((req.body.preco   || '').replace(',', '.'));
  const duracao = parseInt(req.body.duracao || '', 10);

  if (isNaN(preco) || isNaN(duracao)) {
    flash(req, 'erro', 'Preço e duração devem ser numéricos.');
  } else if (!nome || preco < 0 || duracao <= 0) {
    flash(req, 'erro', 'Informe o nome, um preço não negativo e uma duração maior que zero.');
  } else {
    getDb().prepare(
      'INSERT INTO servico (nome, preco, duracao_min) VALUES (?, ?, ?)'
    ).run(nome, preco, duracao);
    flash(req, 'ok', 'Serviço cadastrado.');
  }
  res.redirect('/servicos');
});

// ---------------------------------------------------------------- rotas: agendamentos

app.get('/agendamentos', loginObrigatorio, (req, res) => {
  const db = getDb();
  const lista = db.prepare(`
    SELECT a.id, a.data, a.hora, a.status,
           c.nome AS cliente, s.nome AS servico, s.preco, s.duracao_min,
           b.nome AS barbeiro
      FROM agendamento a
      JOIN cliente c ON c.id = a.cliente_id
      JOIN servico s ON s.id = a.servico_id
      JOIN barbeiro b ON b.id = a.barbeiro_id
     ORDER BY a.data, a.hora
  `).all();

  res.render('agendamentos.html', {
    agendamentos: lista,
    clientes:  db.prepare('SELECT id, nome FROM cliente  ORDER BY nome').all(),
    barbeiros: db.prepare('SELECT id, nome FROM barbeiro ORDER BY nome').all(),
    servicos:  db.prepare('SELECT id, nome FROM servico  ORDER BY nome').all(),
  });
});

app.post('/agendamentos', loginObrigatorio, (req, res) => {
  const cliente_id  = parseInt(req.body.cliente_id,  10);
  const barbeiro_id = parseInt(req.body.barbeiro_id, 10);
  const servico_id  = parseInt(req.body.servico_id,  10);
  const data = req.body.data || '';
  const hora = req.body.hora || '';

  if (isNaN(cliente_id) || isNaN(barbeiro_id) || isNaN(servico_id)) {
    flash(req, 'erro', 'Selecione cliente, barbeiro e serviço.');
    return res.redirect('/agendamentos');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) {
    flash(req, 'erro', 'Data ou hora em formato inválido.');
    return res.redirect('/agendamentos');
  }

  const db = getDb();

  // impede choque de horário para o mesmo barbeiro
  const conflito = db.prepare(
    'SELECT 1 FROM agendamento WHERE barbeiro_id = ? AND data = ? AND hora = ?'
  ).get(barbeiro_id, data, hora);

  if (conflito) {
    flash(req, 'erro', 'Este barbeiro já possui agendamento nesse dia e horário.');
    return res.redirect('/agendamentos');
  }

  try {
    db.prepare(
      'INSERT INTO agendamento (cliente_id, barbeiro_id, servico_id, data, hora) VALUES (?, ?, ?, ?, ?)'
    ).run(cliente_id, barbeiro_id, servico_id, data, hora);
    flash(req, 'ok', 'Agendamento realizado.');
  } catch (e) {
    flash(req, 'erro', 'Cliente, barbeiro ou serviço não encontrado. Recarregue a página.');
  }

  res.redirect('/agendamentos');
});

// ---------------------------------------------------------------- inicializar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SAEP Barbearia rodando em http://localhost:${PORT}`);
});
