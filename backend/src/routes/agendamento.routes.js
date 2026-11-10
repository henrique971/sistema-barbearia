import { Router } from "express"
import {
  criar,
  listar,
  atualizar,
  atualizarStatus,
  cancelar
} from "../controllers/agendamento.controller.js"

const router = Router()

router.post("/", criar)
router.get("/", listar)
router.put("/:id", atualizar)
router.patch("/:id/status", atualizarStatus)
router.delete("/:id", cancelar)

export default router

