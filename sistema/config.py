"""Configurações do sistema."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Chave Fernet de demonstração. Em produção, defina SAEP_CHAVE no ambiente.
CHAVE_DEMO = "uqto25BdOKQRNS9hSQ4EnN_K3RLYmLGKrtvIoCCbf08="


class Config:
    SECRET_KEY = os.environ.get("SAEP_SECRET", "troque-esta-chave")
    CHAVE_CRIPTO = os.environ.get("SAEP_CHAVE", CHAVE_DEMO)
    DB_PATH = os.environ.get("SAEP_DB", os.path.join(BASE_DIR, "..", "saep.db"))
    SESSION_MINUTOS = 30  # expiração da sessão
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
