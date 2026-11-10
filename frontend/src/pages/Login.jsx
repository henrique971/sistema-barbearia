
import { useState } from "react";
import { api } from "../services/api";

export default function Login({ onLogin }) {
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    try {
      if (cadastro) {
        await api("/auth/registrar", {
          method: "POST",
          body: JSON.stringify({ nome, email, senha })
        });
      }

      const dados = await api("/auth/entrar", {
        method: "POST",
        body: JSON.stringify({ email, senha })
      });

      localStorage.setItem("token", dados.token);
      onLogin(dados.usuario);

    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>{cadastro ? "Criar conta" : "Barbearia"}</h1>
        <p>{cadastro ? "Cadastre um usuário" : "Entre na sua conta"}</p>

        {cadastro && (
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          minLength={6}
        />

        {erro && <p className="erro">{erro}</p>}

        <button type="submit">
          {cadastro ? "Cadastrar" : "Entrar"}
        </button>

        <button
          type="button"
          onClick={() => {
            setCadastro(!cadastro);
            setErro("");
          }}
        >
          {cadastro ? "Já tenho uma conta" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
