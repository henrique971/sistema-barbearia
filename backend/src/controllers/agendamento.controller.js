import { prisma } from "../lib/prisma.ts"

export async function criar(req, res) {
  try {
    const {
      cliente_id,
      profissional_id,
      servico_id,
      data_hora,
      observacoes
    } = req.body

    const data = new Date(data_hora)

    if (isNaN(data.getTime()) || data <= new Date()) {
      return res.status(400).json({ error: "Data e horário inválidos." })
    }

    const profissional = await prisma.profissional.findUnique({
      where: { id: Number(profissional_id) }
    })

    if (!profissional || !profissional.ativo) {
      return res.status(400).json({ error: "Profissional indisponível." })
    }

    const servico = await prisma.servico.findUnique({
      where: { id: Number(servico_id) }
    })

    if (!servico || !servico.ativo) {
      return res.status(400).json({ error: "Serviço indisponível." })
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(cliente_id) }
    })

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado." })
    }

    const inicio = data
    const fim = new Date(
      inicio.getTime() + servico.duracao_minutos * 60000
    )

    const conflitos = await prisma.agendamento.findMany({
      where: {
        profissional_id: Number(profissional_id),
        status: { not: "CANCELADO" }
      },
      include: { servico: true }
    })

    const ocupado = conflitos.some((agendamento) => {
      const inicioExistente = agendamento.data_hora
      const fimExistente = new Date(
        inicioExistente.getTime() +
        agendamento.servico.duracao_minutos * 60000
      )

      return inicio < fimExistente && fim > inicioExistente
    })

    if (ocupado) {
      return res.status(409).json({
        error: "O profissional já possui um atendimento nesse horário."
      })
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        cliente_id: Number(cliente_id),
        profissional_id: Number(profissional_id),
        servico_id: Number(servico_id),
        data_hora: data,
        observacoes
      },
      include: {
        cliente: true,
        profissional: true,
        servico: true
      }
    })

    res.status(201).json(agendamento)
  } catch {
    res.status(400).json({ error: "Erro ao criar agendamento." })
  }
}

export async function listar(req, res) {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        cliente: true,
        profissional: true,
        servico: true
      },
      orderBy: { data_hora: "asc" }
    })

    res.json(agendamentos)
  } catch {
    res.status(500).json({ error: "Erro ao listar agendamentos." })
  }
}

export async function atualizar(req, res) {
  try {
    const {
      cliente_id,
      profissional_id,
      servico_id,
      data_hora,
      status,
      observacoes
    } = req.body

    const agendamento = await prisma.agendamento.update({
      where: { id: Number(req.params.id) },
      data: {
        cliente_id: cliente_id !== undefined ? Number(cliente_id) : undefined,
        profissional_id: profissional_id !== undefined ? Number(profissional_id) : undefined,
        servico_id: servico_id !== undefined ? Number(servico_id) : undefined,
        data_hora: data_hora ? new Date(data_hora) : undefined,
        status,
        observacoes
      },
      include: {
        cliente: true,
        profissional: true,
        servico: true
      }
    })

    res.json(agendamento)
  } catch {
    res.status(400).json({ error: "Erro ao atualizar agendamento." })
  }
}

export async function atualizarStatus(req, res) {
  try {
    const { status } = req.body

    const permitidos = [
      "AGENDADO",
      "CONFIRMADO",
      "CONCLUIDO",
      "CANCELADO"
    ]

    if (!permitidos.includes(status)) {
      return res.status(400).json({ error: "Status inválido." })
    }

    const agendamento = await prisma.agendamento.update({
      where: { id: Number(req.params.id) },
      data: { status }
    })

    res.json(agendamento)
  } catch {
    res.status(400).json({ error: "Erro ao atualizar status." })
  }
}

export async function cancelar(req, res) {
  try {
    await prisma.agendamento.update({
      where: { id: Number(req.params.id) },
      data: { status: "CANCELADO" }
    })

    res.json({ mensagem: "Agendamento cancelado." })
  } catch {
    res.status(400).json({ error: "Erro ao cancelar agendamento." })
  }
}

