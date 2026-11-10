/**
 * crypto.js — Criptografia dos dados sensíveis (CPF e senha de barbeiro), conforme a LGPD.
 *
 * Usa AES-256-GCM (simétrico, reversível) para substituir o Fernet do Python.
 * A senha de login dos usuários do sistema não passa por aqui: é guardada como
 * hash bcrypt, que não é reversível.
 */

const crypto = require('crypto');
const config = require('./config');

// Deriva 32 bytes da chave a partir da string de configuração (base64 ou texto)
function getKey() {
  const raw = config.CHAVE_CRIPTO;
  // Tenta decodificar como base64; se tiver 32+ bytes, usa direto
  const buf = Buffer.from(raw, 'base64');
  if (buf.length >= 32) return buf.slice(0, 32);
  // Fallback: deriva com SHA-256
  return crypto.createHash('sha256').update(raw).digest();
}

const KEY = getKey();
const ALGO = 'aes-256-gcm';

/**
 * Cifra um texto e retorna uma string hex no formato:
 * iv(24hex) + ':' + tag(32hex) + ':' + ciphertext(hex)
 */
function cifrar(texto) {
  const iv  = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const enc  = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  const tag  = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + enc.toString('hex');
}

/**
 * Decifra um token produzido por cifrar().
 */
function decifrar(token) {
  const [ivHex, tagHex, encHex] = token.split(':');
  const iv      = Buffer.from(ivHex,  'hex');
  const tag     = Buffer.from(tagHex, 'hex');
  const enc     = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

/**
 * Exibe só os dígitos do meio: ***.456.789-**
 */
function mascarar_cpf(cpf) {
  if (cpf.length !== 11) return 'CPF inválido';
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

module.exports = { cifrar, decifrar, mascarar_cpf };
