import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma.ts"
import { JWT_SECRET } from "../config/env.js"

export async function registrar(req, res) {
  try {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Preencha todos os campos."
      })
    }

    if (senha.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres."
      })
    }

    const existente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existente) {
      return res.status(409).json({
        error: "Este e-mail já está cadastrado."
      })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash
      },
      select: {
        id: true,
        nome: true,
        email: true
      }
    })

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso.",
      usuario
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: "Erro ao cadastrar usuário."
    })
  }
}

export async function entrar(req, res) {
  try {
    const { email, senha } = req.body

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ error: "Email ou senha incorretos." })
    }

    const token = jwt.sign(
      { id: usuario.id },
      JWT_SECRET,
      { expiresIn: "2h" }
    )

    res.json({
      mensagem: "Login realizado.",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar login." })
  }
}

export async function perfil(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true }
    })

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." })
    }

    res.json(usuario)
  } catch {
    res.status(500).json({ error: "Erro ao buscar usuário." })
  }
}

