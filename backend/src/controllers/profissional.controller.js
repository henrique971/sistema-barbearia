import { prisma } from "../lib/prisma.ts"

export async function criar(req, res) {
  try {
    const { nome, cpf, telefone, email } = req.body

    const profissional = await prisma.profissional.create({
      data: { nome, cpf, telefone, email }
    })

    res.status(201).json(profissional)
  } catch {
    res.status(400).json({ error: "Erro ao cadastrar profissional." })
  }
}

export async function listar(req, res) {
  const profissionais = await prisma.profissional.findMany({
    orderBy: { nome: "asc" }
  })

  res.json(profissionais)
}

export async function atualizar(req, res) {
  try {
    const { nome, cpf, telefone, email, ativo } = req.body

    const profissional = await prisma.profissional.update({
      where: { id: Number(req.params.id) },
      data: { nome, cpf, telefone, email, ativo }
    })

    res.json(profissional)
  } catch {
    res.status(400).json({ error: "Erro ao atualizar profissional." })
  }
}

export async function excluir(req, res) {
  try {
    await prisma.profissional.delete({
      where: { id: Number(req.params.id) }
    })

    res.json({ mensagem: "Profissional excluído." })
  } catch {
    res.status(400).json({ error: "Não foi possível excluir o profissional." })
  }
}


