
import CadastroSimples from "../components/CadastroSimples";

export default function Servicos() {
  return (
    <CadastroSimples
      titulo="Serviços"
      rota="/servicos"
      campos={[
        { nome: "nome", label: "Nome" },
        { nome: "descricao", label: "Descrição", obrigatorio: false },
        { nome: "preco", label: "Preço", tipo: "number" },
        { nome: "duracao_minutos", label: "Duração (minutos)", tipo: "number" }
      ]}
    />
  );
}
