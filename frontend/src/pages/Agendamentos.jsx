import { useEffect, useState } from "react";
import { api } from "../services/api";

const formInicial = {
  cliente_id: "",
  profissional_id: "",
  servico_id: "",
  data_hora: "",
  observacoes: ""
};

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      const [listaAgendamentos, listaClientes, listaProfissionais, listaServicos] =
        await Promise.all([
          api("/agendamentos"),
          api("/clientes"),
          api("/profissionais"),
          api("/servicos")
        ]);

      setAgendamentos(listaAgendamentos);
      setClientes(listaClientes);
      setProfissionais(listaProfissionais.filter((p) => p.ativo !== false));
      setServicos(listaServicos.filter((s) => s.ativo !== false));
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregarDados();
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
      await api("/agendamentos", {
        method: "POST",
        body: JSON.stringify({
          cliente_id: Number(form.cliente_id),
          profissional_id: Number(form.profissional_id),
          servico_id: Number(form.servico_id),
          data_hora: new Date(form.data_hora).toISOString(),
          observacoes: form.observacoes || undefined
        })
      });

      setForm(formInicial);
      carregarDados();
    } catch (error) {
      setErro(error.message);
    }
  }

  async function cancelar(id) {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;

    try {
      await api(`/agendamentos/${id}`, { method: "DELETE" });
      carregarDados();
    } catch (error) {
      setErro(error.message);
    }
  }

  function formatarData(dataIso) {
    const data = new Date(dataIso);
    return isNaN(data.getTime())
      ? dataIso
      : data.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
  }

  return (
    <section>
      <h1>Agendamentos</h1>

      <form onSubmit={salvar} className="formulario">
        <select
          name="cliente_id"
          value={form.cliente_id}
          onChange={alterar}
          required
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} ({c.telefone})
            </option>
          ))}
        </select>

        <select
          name="profissional_id"
          value={form.profissional_id}
          onChange={alterar}
          required
        >
          <option value="">Selecione o profissional</option>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <select
          name="servico_id"
          value={form.servico_id}
          onChange={alterar}
          required
        >
          <option value="">Selecione o serviço</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} - R$ {Number(s.preco).toFixed(2)} ({s.duracao_minutos} min)
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          name="data_hora"
          value={form.data_hora}
          onChange={alterar}
          required
        />

        <input
          name="observacoes"
          placeholder="Observações (opcional)"
          value={form.observacoes}
          onChange={alterar}
        />

        <button type="submit">Agendar</button>
      </form>

      {erro && <p className="erro">{erro}</p>}

      <table>
        <thead>
          <tr>
            <th>Data e Horário</th>
            <th>Cliente</th>
            <th>Profissional</th>
            <th>Serviço</th>
            <th>Status</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {agendamentos.map((item) => (
            <tr key={item.id}>
              <td>{formatarData(item.data_hora)}</td>
              <td>{item.cliente?.nome || "-"}</td>
              <td>{item.profissional?.nome || "-"}</td>
              <td>{item.servico?.nome || "-"}</td>
              <td>{item.status}</td>
              <td>{item.observacoes || "-"}</td>
              <td>
                {item.status !== "CANCELADO" && (
                  <button onClick={() => cancelar(item.id)}>
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

