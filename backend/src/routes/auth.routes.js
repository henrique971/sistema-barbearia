import { Router } from "express"
import { registrar, entrar, perfil } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/registrar", registrar)
router.post("/entrar", entrar)
router.get("/perfil", authMiddleware, perfil)

export default router

