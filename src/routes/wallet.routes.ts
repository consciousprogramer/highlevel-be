import { Router } from "express"

import {
	fetchWalletParamsSchema,
	transactBodySchema,
	walletSetupBodySchema,
} from "@/validation/request/walletRequest.validation.js"
import { bodyValidator, paramsValidator } from "@/utils/index.js"
import {
	fetchWalletController,
	transactController,
	walletSetupController,
} from "@/controllers/index.js"

const walletRouter = Router()

walletRouter.post(
	"/setup",
	bodyValidator(walletSetupBodySchema),
	walletSetupController
)

walletRouter.post(
	"/:walletId/transact",
	paramsValidator(fetchWalletParamsSchema),
	bodyValidator(transactBodySchema),
	transactController
)

walletRouter.get(
	"/:walletId",
	paramsValidator(fetchWalletParamsSchema),
	fetchWalletController
)

export default walletRouter
