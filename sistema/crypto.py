"""Criptografia dos dados sensíveis (CPF e senha de barbeiro), conforme a LGPD.

Usa Fernet (simétrico, reversível). A senha de login dos usuários do sistema
não passa por aqui: ela é guardada como hash (werkzeug), que não é reversível.
"""
from cryptography.fernet import Fernet

from config import Config


def _fernet():
    return Fernet(Config.CHAVE_CRIPTO.encode())


def cifrar(texto):
    return _fernet().encrypt(texto.encode("utf-8")).decode("ascii")


def decifrar(token):
    return _fernet().decrypt(token.encode("ascii")).decode("utf-8")


def mascarar_cpf(cpf):
    """Exibe só os dígitos do meio: ***.456.789-**"""
    if len(cpf) != 11:
        return "CPF inválido"
    return f"***.{cpf[3:6]}.{cpf[6:9]}-**"
