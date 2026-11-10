'use strict';

const path   = require('path');
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');

const RAIZ       = path.join(__dirname, '..');
const { cifrar } = require('../servidor/crypto');
const DB_PATH    = path.join(RAIZ, 'saep.db');

const USUARIOS = [
  { id: 1, nome: 'Ana Souza',     login: 'ana',     senha: 'ana123'     },
  { id: 2, nome: 'Carlos Lima',   login: 'carlos',  senha: 'carlos123'  },
  { id: 3, nome: 'Juliana Melo',  login: 'juliana', senha: 'juliana123' },
];

const BARBEIROS = [
  { id: 1, nome: 'Rafael Costa', telefone: '(11) 98888-1111', cpf: '12345678901', senha: 'rafa123'  },
  { id: 2, nome: 'Bruno Alves',  telefone: '(11) 98888-2222', cpf: '98765432100', senha: 'bruno123' },
  { id: 3, nome: 'Diego Nunes',  telefone: '(11) 98888-3333', cpf: '11122233344', senha: 'diego123' },
];

const CLIENTES = [
  { id: 1, nome: 'Marcos Pereira', telefone: '(11) 97777-1111', cpf: '55566677788' },
  { id: 2, nome: 'Lucas Ferreira', telefone: '(11) 97777-2222', cpf: '22233344455' },
  { id: 3, nome: 'Pedro Oliveira', telefone: '(11) 97777-3333', cpf: '66677788899' },
];

const SERVICOS = [
  { id: 1, nome: 'Corte masculino', preco: 45.00, duracao_min: 30 },
  { id: 2, nome: 'Barba completa',  preco: 35.00, duracao_min: 20 },
  { id: 3, nome: 'Corte + barba',   preco: 70.00, duracao_min: 50 },
];

const AGENDAMENTOS = [
  { id: 1, cliente_id: 1, barbeiro_id: 1, servico_id: 3, data: '2026-11-10', hora: '09:00', status: 'marcado' },
  { id: 2, cliente_id: 2, barbeiro_id: 2, servico_id: 1, data: '2026-11-10', hora: '10:00', status: 'marcado' },
  { id: 3, cliente_id: 3, barbeiro_id: 3, servico_id: 2, data: '2026-11-11', hora: '14:30', status: 'marcado' },
];

async function gerar() {
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    DROP TABLE IF EXISTS agendamento;
    DROP TABLE IF EXISTS servico;
    DROP TABLE IF EXISTS cliente;
    DROP TABLE IF EXISTS barbeiro;
    DROP TABLE IF EXISTS usuario;

    CREATE TABLE usuario (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nome       TEXT    NOT NULL,
      login      TEXT    NOT NULL UNIQUE,
      senha_hash TEXT    NOT NULL
    );

    CREATE TABLE barbeiro (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      nome                TEXT    NOT NULL,
      telefone            TEXT,
      cpf_criptografado   TEXT    NOT NULL,
      senha_criptografada TEXT    NOT NULL
    );

    CREATE TABLE cliente (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      nome              TEXT    NOT NULL,
      telefone          TEXT,
      cpf_criptografado TEXT    NOT NULL
    );

    CREATE TABLE servico (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT    NOT NULL,
      preco       REAL    NOT NULL CHECK (preco >= 0),
      duracao_min INTEGER NOT NULL CHECK (duracao_min > 0)
    );

    CREATE TABLE agendamento (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id  INTEGER NOT NULL REFERENCES cliente(id),
      barbeiro_id INTEGER NOT NULL REFERENCES barbeiro(id),
      servico_id  INTEGER NOT NULL REFERENCES servico(id),
      data        TEXT    NOT NULL,
      hora        TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'marcado',
      UNIQUE (barbeiro_id, data, hora)
    );
  `);

  const insUsuario = db.prepare('INSERT INTO usuario (id, nome, login, senha_hash) VALUES (?, ?, ?, ?)');
  for (const u of USUARIOS) {
    insUsuario.run(u.id, u.nome, u.login, await bcrypt.hash(u.senha, 12));
  }

  const insBarb = db.prepare('INSERT INTO barbeiro (id, nome, telefone, cpf_criptografado, senha_criptografada) VALUES (?, ?, ?, ?, ?)');
  for (const b of BARBEIROS) {
    insBarb.run(b.id, b.nome, b.telefone, cifrar(b.cpf), cifrar(b.senha));
  }

  const insCli = db.prepare('INSERT INTO cliente (id, nome, telefone, cpf_criptografado) VALUES (?, ?, ?, ?)');
  for (const c of CLIENTES) {
    insCli.run(c.id, c.nome, c.telefone, cifrar(c.cpf));
  }

  const insServ = db.prepare('INSERT INTO servico (id, nome, preco, duracao_min) VALUES (?, ?, ?, ?)');
  for (const s of SERVICOS) insServ.run(s.id, s.nome, s.preco, s.duracao_min);

  const insAgend = db.prepare('INSERT INTO agendamento (id, cliente_id, barbeiro_id, servico_id, data, hora, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const a of AGENDAMENTOS) {
    insAgend.run(a.id, a.cliente_id, a.barbeiro_id, a.servico_id, a.data, a.hora, a.status);
  }

  db.close();
  console.log('Banco gerado em: ' + DB_PATH);
  console.log('Logins: ana/ana123  carlos/carlos123  juliana/juliana123');
}

gerar().catch(err => { console.error(err); process.exit(1); });
