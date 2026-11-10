import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/env.js"

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token não informado." })
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." })
  }
}


