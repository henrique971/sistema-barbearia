import { prisma } from "../lib/prisma.ts"

export async function criar(req, res) {
  try {
    const { nome, cpf, telefone, email } = req.body

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cpf,
        telefone,
        email,
        criado_por: req.usuario.id
      }
    })

    res.status(201).json(cliente)
  } catch {
    res.status(400).json({ error: "Erro ao cadastrar cliente. Verifique os dados e o CPF." })
  }
}

export async function listar(req, res) {
  try {
    const { busca } = req.query

    const clientes = await prisma.cliente.findMany({
      where: busca ? {
        OR: [
          { nome: { contains: busca, mode: "insensitive" } },
          { cpf: { contains: busca } },
          { telefone: { contains: busca } }
        ]
      } : {},
      orderBy: { nome: "asc" }
    })

    res.json(clientes)
  } catch {
    res.status(500).json({ error: "Erro ao listar clientes." })
  }
}

export async function buscarPorId(req, res) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado." })
    }

    res.json(cliente)
  } catch {
    res.status(500).json({ error: "Erro ao buscar cliente." })
  }
}

export async function atualizar(req, res) {
  try {
    const { nome, cpf, telefone, email } = req.body

    const cliente = await prisma.cliente.update({
      where: { id: Number(req.params.id) },
      data: { nome, cpf, telefone, email }
    })

    res.json(cliente)
  } catch {
    res.status(400).json({ error: "Erro ao atualizar cliente." })
  }
}

export async function excluir(req, res) {
  try {
    await prisma.cliente.delete({
      where: { id: Number(req.params.id) }
    })

    res.json({ mensagem: "Cliente excluído." })
  } catch {
    res.status(400).json({ error: "Não foi possível excluir o cliente." })
  }
}

