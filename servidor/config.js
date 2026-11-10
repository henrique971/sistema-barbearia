const path = require('path');

const CHAVE_DEMO = 'uqto25BdOKQRNS9hSQ4EnN_K3RLYmLGKrtvIoCCbf08=';

const config = {
  SECRET_KEY:      process.env.SAEP_SECRET || 'troque-esta-chave',
  CHAVE_CRIPTO:    process.env.SAEP_CHAVE  || CHAVE_DEMO,
  DB_PATH:         process.env.SAEP_DB     || path.join(__dirname, '..', 'saep.db'),
  SESSION_MINUTOS: 30,
  PORT:            process.env.PORT        || 3000,
};

module.exports = config;
