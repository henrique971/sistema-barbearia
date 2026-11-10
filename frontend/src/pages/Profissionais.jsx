
import CadastroSimples from "../components/CadastroSimples";

export default function Profissionais() {
  return (
    <CadastroSimples
      titulo="Profissionais"
      rota="/profissionais"
      campos={[
        { nome: "nome", label: "Nome" },
        { nome: "cpf", label: "CPF" },
        { nome: "telefone", label: "Telefone" },
        { nome: "email", label: "Email", obrigatorio: false }
      ]}
    />
  );
}
