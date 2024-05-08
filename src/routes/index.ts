import { Router } from "express"
import walletRouter from "./wallet.routes.js"
import transactionRouter from "./transaction.routes.js"

const rootRouter = Router()

rootRouter.use("/wallet", walletRouter)
rootRouter.use("/transaction", transactionRouter)

export default rootRouter
