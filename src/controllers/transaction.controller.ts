import { sendSuccessResponse } from "../utils/response.util.js"
import {
	fetchWalletTransactionsService,
	fetchATransactionService,
	generateTransactionsCSVService,
	checkCsvGenerationJobStatusService,
} from "@services/transaction.services.js"
import { getModelPaginationType } from "@/types/index.js"
import { Transaction } from "@/models/index.js"
import { RequestHandler } from "express"

export const fetchTransactionsController: RequestHandler<
	{
		walletId: string
	},
	unknown,
	unknown,
	getModelPaginationType<Transaction>
> = async (req, res, next) => {
	try {
		const { walletId } = req.params
		const data = await fetchWalletTransactionsService(walletId, req.query)

		sendSuccessResponse(res, "Transactions fetched successfully", data)
	} catch (error) {
		next(error)
	}
}

export const fetchATransactionController: RequestHandler<{
	transactionId: string
}> = async (req, res, next) => {
	try {
		const { transactionId } = req.params

		const data = await fetchATransactionService(transactionId)

		sendSuccessResponse(res, "Transactions fetched successfully", data)
	} catch (error) {
		next(error)
	}
}

export const generateTransactionsCSVController: RequestHandler<{
	walletId: string
}> = async (req, res, next) => {
	try {
		const { walletId } = req.params
		const data = await generateTransactionsCSVService(walletId)

		sendSuccessResponse(res, "CSV generated successfully", data)
	} catch (error) {
		next(error)
	}
}

export const csvGenerationStatusCheckController: RequestHandler<{
	jobRecordId: string
}> = async (req, res, next) => {
	try {
		const { jobRecordId } = req.params

		const data = await checkCsvGenerationJobStatusService(jobRecordId)

		sendSuccessResponse(
			res,
			data === null
				? "CSV is being generated, please wait."
				: "CSV generated successfully",
			data
		)
	} catch (error) {
		next(error)
	}
}
