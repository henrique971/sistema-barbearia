import { Router } from "express"
import authRoutes from "./auth.routes.js"
import clienteRoutes from "./cliente.routes.js"
import profissionalRoutes from "./profissional.routes.js"
import servicoRoutes from "./servico.routes.js"
import agendamentoRoutes from "./agendamento.routes.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.use("/auth", authRoutes)

router.use("/clientes", authMiddleware, clienteRoutes)
router.use("/profissionais", authMiddleware, profissionalRoutes)
router.use("/servicos", authMiddleware, servicoRoutes)
router.use("/agendamentos", authMiddleware, agendamentoRoutes)

export default router

