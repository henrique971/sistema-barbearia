"""SAEP Barbearia - aplicação principal (Flask + SQLite)."""
import functools
import re
import sqlite3
from datetime import timedelta

from flask import Flask, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash

from config import Config
from crypto import cifrar, decifrar, mascarar_cpf

app = Flask(__name__)
app.config.from_object(Config)
app.permanent_session_lifetime = timedelta(minutes=Config.SESSION_MINUTOS)


# ---------------------------------------------------------------- utilitários

def get_db():
    """Uma conexão por requisição, fechada ao final."""
    if "db" not in g:
        g.db = sqlite3.connect(Config.DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def fecha_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def somente_digitos(texto):
    return re.sub(r"\D", "", texto or "")


def com_cpf_mascarado(linhas):
    """Converte linhas de cliente/barbeiro trocando o CPF cifrado pelo CPF mascarado."""
    return [
        {
            "id": l["id"],
            "nome": l["nome"],
            "telefone": l["telefone"],
            "cpf": mascarar_cpf(decifrar(l["cpf_criptografado"])),
        }
        for l in linhas
    ]


def login_obrigatorio(view):
    @functools.wraps(view)
    def envoltorio(*args, **kwargs):
        if "usuario_id" not in session:
            flash("Sessão expirada ou inexistente. Faça login novamente.", "erro")
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return envoltorio


# ---------------------------------------------------------------- login

@app.route("/")
def raiz():
    return redirect(url_for("painel") if "usuario_id" in session else url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        login_digitado = request.form.get("login", "").strip()
        senha = request.form.get("senha", "")

        usuario = get_db().execute(
            "SELECT id, nome, senha_hash FROM usuario WHERE login = ?", (login_digitado,)
        ).fetchone()

        # mensagem genérica: não revela se foi o usuário ou a senha que errou
        if usuario is None or not check_password_hash(usuario["senha_hash"], senha):
            flash("Usuário ou senha inválidos.", "erro")
            return render_template("login.html"), 401

        session.clear()
        session.permanent = True  # ativa a expiração por tempo (Config.SESSION_MINUTOS)
        session["usuario_id"] = usuario["id"]
        session["nome"] = usuario["nome"]
        return redirect(url_for("painel"))

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("Sessão encerrada.", "ok")
    return redirect(url_for("login"))


# ---------------------------------------------------------------- painel

@app.route("/painel")
@login_obrigatorio
def painel():
    db = get_db()
    contagens = {
        tabela: db.execute(f"SELECT COUNT(*) FROM {tabela}").fetchone()[0]
        for tabela in ("cliente", "barbeiro", "servico", "agendamento")
    }
    return render_template("painel.html", contagens=contagens)


# ---------------------------------------------------------------- clientes

@app.route("/clientes", methods=["GET", "POST"])
@login_obrigatorio
def clientes():
    db = get_db()

    if request.method == "POST":
        nome = request.form.get("nome", "").strip()
        telefone = request.form.get("telefone", "").strip()
        cpf = somente_digitos(request.form.get("cpf", ""))

        if not nome or len(cpf) != 11:
            flash("Informe o nome e um CPF com 11 dígitos.", "erro")
        else:
            db.execute(
                "INSERT INTO cliente (nome, telefone, cpf_criptografado) VALUES (?, ?, ?)",
                (nome, telefone, cifrar(cpf)),
            )
            db.commit()
            flash("Cliente cadastrado.", "ok")
        return redirect(url_for("clientes"))

    # a busca é feita só pelo nome: o CPF está criptografado e não aceita LIKE
    busca = request.args.get("busca", "").strip()
    linhas = db.execute(
        "SELECT id, nome, telefone, cpf_criptografado FROM cliente "
        "WHERE nome LIKE ? ORDER BY nome",
        (f"%{busca}%",),
    ).fetchall()
    return render_template("clientes.html", clientes=com_cpf_mascarado(linhas), busca=busca)


# ---------------------------------------------------------------- barbeiros

@app.route("/barbeiros", methods=["GET", "POST"])
@login_obrigatorio
def barbeiros():
    db = get_db()

    if request.method == "POST":
        nome = request.form.get("nome", "").strip()
        telefone = request.form.get("telefone", "").strip()
        cpf = somente_digitos(request.form.get("cpf", ""))
        senha = request.form.get("senha", "")

        if not nome or len(cpf) != 11 or len(senha) < 6:
            flash("Informe o nome, um CPF com 11 dígitos e uma senha de 6+ caracteres.", "erro")
        else:
            db.execute(
                "INSERT INTO barbeiro (nome, telefone, cpf_criptografado, senha_criptografada) "
                "VALUES (?, ?, ?, ?)",
                (nome, telefone, cifrar(cpf), cifrar(senha)),
            )
            db.commit()
            flash("Barbeiro cadastrado.", "ok")
        return redirect(url_for("barbeiros"))

    linhas = db.execute(
        "SELECT id, nome, telefone, cpf_criptografado FROM barbeiro ORDER BY nome"
    ).fetchall()
    return render_template("barbeiros.html", barbeiros=com_cpf_mascarado(linhas))


# ---------------------------------------------------------------- serviços

@app.route("/servicos", methods=["GET", "POST"])
@login_obrigatorio
def servicos():
    db = get_db()

    if request.method == "POST":
        nome = request.form.get("nome", "").strip()
        try:
            preco = float(request.form.get("preco", "").replace(",", "."))
            duracao = int(request.form.get("duracao", ""))
        except ValueError:
            flash("Preço e duração devem ser numéricos.", "erro")
            return redirect(url_for("servicos"))

        if not nome or preco < 0 or duracao <= 0:
            flash("Informe o nome, um preço não negativo e uma duração maior que zero.", "erro")
        else:
            db.execute(
                "INSERT INTO servico (nome, preco, duracao_min) VALUES (?, ?, ?)",
                (nome, preco, duracao),
            )
            db.commit()
            flash("Serviço cadastrado.", "ok")
        return redirect(url_for("servicos"))

    lista = db.execute("SELECT id, nome, preco, duracao_min FROM servico ORDER BY nome").fetchall()
    return render_template("servicos.html", servicos=lista)


# ---------------------------------------------------------------- agendamentos

@app.route("/agendamentos", methods=["GET", "POST"])
@login_obrigatorio
def agendamentos():
    db = get_db()

    if request.method == "POST":
        # cliente, barbeiro e serviço são obrigatórios
        try:
            cliente_id = int(request.form["cliente_id"])
            barbeiro_id = int(request.form["barbeiro_id"])
            servico_id = int(request.form["servico_id"])
        except (KeyError, ValueError):
            flash("Selecione cliente, barbeiro e serviço.", "erro")
            return redirect(url_for("agendamentos"))

        data = request.form.get("data", "")
        hora = request.form.get("hora", "")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data) or not re.fullmatch(r"\d{2}:\d{2}", hora):
            flash("Data ou hora em formato inválido.", "erro")
            return redirect(url_for("agendamentos"))

        # impede choque de horário para o mesmo barbeiro
        conflito = db.execute(
            "SELECT 1 FROM agendamento WHERE barbeiro_id = ? AND data = ? AND hora = ?",
            (barbeiro_id, data, hora),
        ).fetchone()
        if conflito:
            flash("Este barbeiro já possui agendamento nesse dia e horário.", "erro")
            return redirect(url_for("agendamentos"))

        try:
            db.execute(
                "INSERT INTO agendamento (cliente_id, barbeiro_id, servico_id, data, hora) "
                "VALUES (?, ?, ?, ?, ?)",
                (cliente_id, barbeiro_id, servico_id, data, hora),
            )
            db.commit()
            flash("Agendamento realizado.", "ok")
        except sqlite3.IntegrityError:
            flash("Cliente, barbeiro ou serviço não encontrado. Recarregue a página.", "erro")
        return redirect(url_for("agendamentos"))

    lista = db.execute(
        """
        SELECT a.id, a.data, a.hora, a.status,
               c.nome AS cliente, s.nome AS servico, s.preco, s.duracao_min,
               b.nome AS barbeiro
          FROM agendamento a
          JOIN cliente c ON c.id = a.cliente_id
          JOIN servico s ON s.id = a.servico_id
          JOIN barbeiro b ON b.id = a.barbeiro_id
         ORDER BY a.data, a.hora
        """
    ).fetchall()

    return render_template(
        "agendamentos.html",
        agendamentos=lista,
        clientes=db.execute("SELECT id, nome FROM cliente ORDER BY nome").fetchall(),
        barbeiros=db.execute("SELECT id, nome FROM barbeiro ORDER BY nome").fetchall(),
        servicos=db.execute("SELECT id, nome FROM servico ORDER BY nome").fetchall(),
    )


if __name__ == "__main__":
    app.run(debug=True)
