const crypto = require('crypto');
const config = require('./config');

function getKey() {
  const buf = Buffer.from(config.CHAVE_CRIPTO, 'base64');
  if (buf.length >= 32) return buf.slice(0, 32);
  return crypto.createHash('sha256').update(config.CHAVE_CRIPTO).digest();
}

const KEY  = getKey();
const ALGO = 'aes-256-gcm';

function cifrar(texto) {
  const iv     = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const enc    = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + enc.toString('hex');
}

function decifrar(token) {
  const [ivHex, tagHex, encHex] = token.split(':');
  const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]).toString('utf8');
}

function mascarar_cpf(cpf) {
  if (cpf.length !== 11) return 'CPF inválido';
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

module.exports = { cifrar, decifrar, mascarar_cpf };
