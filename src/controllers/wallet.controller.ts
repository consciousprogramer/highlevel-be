import { NextFunction, Request, RequestHandler } from "express"
import { sendSuccessResponse } from "../utils/response.util.js"
import { StatusCodes } from "http-status-codes"
import {
	fetchWalletService,
	transactService,
	walletSetupService,
} from "../services/wallet.services.js"

// connected the setUp all the Item
export const walletSetupController: RequestHandler<
	unknown,
	unknown,
	{
		name: string
		balance: number
	}
> = async (req, res, next) => {
	try {
		const data = req.body
		const wallet = await walletSetupService(data)

		sendSuccessResponse(
			res,
			"wallet created successfully",
			wallet,
			StatusCodes.CREATED
		)
	} catch (error) {
		next(error)
	}
}

export const transactController: RequestHandler<
	{ walletId: string },
	unknown,
	{
		amount: number
		description?: string
	}
> = async (req, res, next) => {
	try {
		const { walletId } = req.params


		const result = await transactService({
			walletId,
			...req.body,
		})

		sendSuccessResponse(
			res,
			"Transactions fetched successfully",
			result,
			StatusCodes.CREATED
		)
	} catch (error) {
		next(error)
	}
}

export const fetchWalletController: RequestHandler<{
	walletId: string
}> = async (req, res, next) => {
	try {
		const { walletId } = req.params

		const wallet = await fetchWalletService(walletId)

		sendSuccessResponse(res, "wallet fetched successfully", wallet)
	} catch (error) {
		next(error)
	}
}
