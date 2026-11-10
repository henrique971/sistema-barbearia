import { Router } from "express"
import { criar, listar, atualizar, excluir } from "../controllers/servico.controller.js"

const router = Router()

router.post("/", criar)
router.get("/", listar)
router.put("/:id", atualizar)
router.delete("/:id", excluir)

export default router

