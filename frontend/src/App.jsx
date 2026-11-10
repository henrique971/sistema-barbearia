import { useState, useEffect } from "react";
import { api } from "./services/api";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Profissionais from "./pages/Profissionais";
import Servicos from "./pages/Servicos";
import Agendamentos from "./pages/Agendamentos";
import "./App.css";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState("inicio");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarLogin() {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const dados = await api("/auth/perfil");
          setUsuario(dados);
        } catch {
          localStorage.removeItem("token");
        }
      }

      setCarregando(false);
    }

    verificarLogin();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setUsuario(null);
    setPagina("inicio");
  }

  if (carregando) return <p>Carregando...</p>;

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  return (
    <div className="app">
      <header>
        <h2>BARBEARIA</h2>

        <nav>
          <button onClick={() => setPagina("inicio")}>
            Início
          </button>

          <button onClick={() => setPagina("clientes")}>
            Clientes
          </button>

          <button onClick={() => setPagina("profissionais")}>
            Profissionais
          </button>

          <button onClick={() => setPagina("servicos")}>
            Serviços
          </button>

          <button onClick={() => setPagina("agendamentos")}>
            Agendamentos
          </button>

          <button onClick={logout}>
            Sair
          </button>
        </nav>
      </header>

      <main>
        {pagina === "inicio" && (
          <section>
            <h1>Olá, {usuario.nome}.</h1>
            <p>Bem-vindo ao sistema de gestão da barbearia.</p>

            <div className="cards">
              <button onClick={() => setPagina("clientes")}>
                Gerenciar clientes
              </button>

              <button onClick={() => setPagina("profissionais")}>
                Gerenciar profissionais
              </button>

              <button onClick={() => setPagina("servicos")}>
                Gerenciar serviços
              </button>

              <button onClick={() => setPagina("agendamentos")}>
                Gerenciar agendamentos
              </button>
            </div>
          </section>
        )}

        {pagina === "clientes" && <Clientes />}
        {pagina === "profissionais" && <Profissionais />}
        {pagina === "servicos" && <Servicos />}
        {pagina === "agendamentos" && <Agendamentos />}
      </main>
    </div>
  );
}

