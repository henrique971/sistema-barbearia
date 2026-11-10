import { Router } from "express"
import { criar, listar, buscarPorId, atualizar, excluir } from "../controllers/cliente.controller.js"

const router = Router()

router.post("/", criar)
router.get("/", listar)
router.get("/:id", buscarPorId)
router.put("/:id", atualizar)
router.delete("/:id", excluir)

export default router


