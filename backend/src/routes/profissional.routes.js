import { Router } from "express"
import { criar, listar, atualizar, excluir } from "../controllers/profissional.controller.js"

const router = Router()

router.post("/", criar)
router.get("/", listar)
router.put("/:id", atualizar)
router.delete("/:id", excluir)

export default router

