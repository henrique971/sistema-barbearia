
import { useEffect, useState } from "react";
import { api } from "../services/api";

const vazio = {
  nome: "",
  cpf: "",
  telefone: "",
  email: ""
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(vazio);
  const [id, setId] = useState(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");

  async function carregar(termo = busca) {
    try {
      const dados = await api(
        `/clientes?busca=${encodeURIComponent(termo)}`
      );
      setClientes(dados);
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregar("");
  }, []);

  function alterar(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");

    try {
      await api(id ? `/clientes/${id}` : "/clientes", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(form)
      });

      setForm(vazio);
      setId(null);
      await carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  function editar(cliente) {
    setId(cliente.id);
    setForm({
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      email: cliente.email || ""
    });
  }

  async function excluir(id) {
    if (!confirm("Deseja excluir este cliente?")) return;

    try {
      await api(`/clientes/${id}`, { method: "DELETE" });
      carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <section>
      <h1>Clientes</h1>

      <form onSubmit={salvar} className="formulario">
        <input
          name="nome"
          placeholder="Nome"
          value={form.nome}
          onChange={alterar}
          required
        />

        <input
          name="cpf"
          placeholder="CPF (somente números)"
          value={form.cpf}
          onChange={alterar}
          maxLength={11}
          required
        />

        <input
          name="telefone"
          placeholder="Telefone"
          value={form.telefone}
          onChange={alterar}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={alterar}
        />

        <button type="submit">
          {id ? "Salvar alterações" : "Cadastrar"}
        </button>

        {id && (
          <button type="button" onClick={() => {
            setId(null);
            setForm(vazio);
          }}>
            Cancelar edição
          </button>
        )}
      </form>

      <form onSubmit={e => {
        e.preventDefault();
        carregar();
      }}>
        <input
          placeholder="Buscar cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <button type="submit">Buscar</button>
        <button type="button" onClick={() => {
          setBusca("");
          carregar("");
        }}>
          Limpar
        </button>
      </form>

      {erro && <p className="erro">{erro}</p>}

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.cpf}</td>
              <td>{cliente.telefone}</td>
              <td>{cliente.email}</td>
              <td>
                <button onClick={() => editar(cliente)}>
                  Editar
                </button>
                <button onClick={() => excluir(cliente.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
