import { Router } from "express"
import {
	csvGenerationStatusCheckController,
	fetchATransactionController,
	fetchTransactionsController,
	generateTransactionsCSVController,
} from "@/controllers/transaction.controller.js"

import {
	fetchATransactionParamsSchema,
	fetchTransactionsQuerySchema,
	jobRecordIdValidator,
	walletIdValidator,
} from "@/validation/request/transactionRequest.validation.js"
import { paramsValidator, queryValidator } from "@/utils/index.js"

const transactionRouter = Router()

transactionRouter.get(
	"/:walletId",
	paramsValidator(walletIdValidator),
	queryValidator(fetchTransactionsQuerySchema),
	// @ts-ignore
	fetchTransactionsController
)
transactionRouter.get(
	"/:id",
	paramsValidator(fetchATransactionParamsSchema),
	fetchATransactionController
)

// TODO: rate limit this endpoint
transactionRouter.get(
	"/:walletId/csv",
	paramsValidator(walletIdValidator),
	generateTransactionsCSVController
)

transactionRouter.get(
	"/:walletId/csv/status",
	paramsValidator(jobRecordIdValidator),
	csvGenerationStatusCheckController
)

export default transactionRouter
