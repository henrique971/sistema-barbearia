import { prisma } from "../lib/prisma.ts"

export async function criar(req, res) {
  try {
    const { nome, descricao, preco, duracao_minutos } = req.body

    const servico = await prisma.servico.create({
      data: { nome, descricao, preco, duracao_minutos }
    })

    res.status(201).json(servico)
  } catch {
    res.status(400).json({ error: "Erro ao cadastrar serviço." })
  }
}

export async function listar(req, res) {
  const servicos = await prisma.servico.findMany({
    orderBy: { nome: "asc" }
  })

  res.json(servicos)
}

export async function atualizar(req, res) {
  try {
    const { nome, descricao, preco, duracao_minutos, ativo } = req.body

    const servico = await prisma.servico.update({
      where: { id: Number(req.params.id) },
      data: { nome, descricao, preco, duracao_minutos, ativo }
    })

    res.json(servico)
  } catch {
    res.status(400).json({ error: "Erro ao atualizar serviço." })
  }
}

export async function excluir(req, res) {
  try {
    await prisma.servico.delete({
      where: { id: Number(req.params.id) }
    })

    res.json({ mensagem: "Serviço excluído." })
  } catch {
    res.status(400).json({ error: "Não foi possível excluir o serviço." })
  }
}

