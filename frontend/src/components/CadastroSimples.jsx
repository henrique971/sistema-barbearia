
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function CadastroSimples({ titulo, rota, campos }) {
  const inicial = Object.fromEntries(
    campos.map(campo => [campo.nome, campo.tipo === "number" ? "" : ""])
  );

  const [dados, setDados] = useState([]);
  const [form, setForm] = useState(inicial);
  const [id, setId] = useState(null);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      setDados(await api(rota));
    } catch (error) {
      setErro(error.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar(e) {
    e.preventDefault();
    setErro("");

    const corpo = { ...form };

    campos.forEach(campo => {
      if (campo.tipo === "number") {
        corpo[campo.nome] = Number(corpo[campo.nome]);
      }
    });

    try {
      await api(id ? `${rota}/${id}` : rota, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(corpo)
      });

      setForm(inicial);
      setId(null);
      carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  function editar(item) {
    setId(item.id);

    const valores = {};
    campos.forEach(campo => {
      valores[campo.nome] = item[campo.nome] ?? "";
    });

    setForm(valores);
  }

  async function excluir(id) {
    if (!confirm("Deseja excluir este registro?")) return;

    try {
      await api(`${rota}/${id}`, { method: "DELETE" });
      carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <section>
      <h1>{titulo}</h1>

      <form onSubmit={salvar} className="formulario">
        {campos.map(campo => (
          <input
            key={campo.nome}
            name={campo.nome}
            type={campo.tipo === "number" ? "number" : "text"}
            step={campo.tipo === "number" ? "0.01" : undefined}
            placeholder={campo.label}
            value={form[campo.nome]}
            onChange={alterar}
            required={campo.obrigatorio !== false}
            min={campo.tipo === "number" ? "0" : undefined}
          />
        ))}

        <button type="submit">
          {id ? "Salvar alterações" : "Cadastrar"}
        </button>

        {id && (
          <button type="button" onClick={() => {
            setId(null);
            setForm(inicial);
          }}>
            Cancelar
          </button>
        )}
      </form>

      {erro && <p className="erro">{erro}</p>}

      <table>
        <thead>
          <tr>
            {campos.map(campo => (
              <th key={campo.nome}>{campo.label}</th>
            ))}
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados.map(item => (
            <tr key={item.id}>
              {campos.map(campo => (
                <td key={campo.nome}>{item[campo.nome]}</td>
              ))}

              <td>
                <button onClick={() => editar(item)}>
                  Editar
                </button>
                <button onClick={() => excluir(item.id)}>
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
