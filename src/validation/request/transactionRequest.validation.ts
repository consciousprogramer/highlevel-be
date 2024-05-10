import { SORT_ORDER } from "@/utils/index.js"
import Joi from "joi"
import { appConfig } from "@/configs/app.config.js"

const { limit, skip, sortOn, sortOrder } = appConfig.paginationDefaults

export const fetchTransactionsQuerySchema = Joi.object({
	limit: Joi.number().integer().min(1).default(limit).messages({
		"number.base": "limit must be a number",
		"number.integer": "limit must be an integer",
		"number.min": "limit must be greater than or equal to 1",
		"any.required": "limit is required",
	}),
	skip: Joi.number().integer().min(0).default(skip).messages({
		"number.base": "skip must be a number",
		"number.integer": "skip must be an integer",
		"number.min": "skip must be greater than or equal to 0",
		"any.required": "skip is required",
	}),
	sortOn: Joi.string().default(sortOn).messages({
		"string.base": "sortOn must be a string",
		"any.required": "sortOn is required",
	}),
	sortOrder: Joi.string()
		.valid(...Object.values(SORT_ORDER))
		.default(sortOrder)
		.messages({
			"string.base": "sortOrder must be a string",
			"string.valid": `sortOrder must be one of ${Object.values(SORT_ORDER).join(",")}`,
			"any.required": "sortOrder is required",
		}),
})

export const fetchATransactionParamsSchema = Joi.object({
	transactionId: Joi.string().required().messages({
		"string.base": "transactionId must be a string",
		"any.required": "transactionId is required",
	}),
})

export const walletIdValidator = Joi.object({
	walletId: Joi.string().required().messages({
		"string.base": "walletId must be a string",
		"any.required": "walletId is required",
	}),
})

export const jobRecordIdValidator = Joi.object({
	walletId: Joi.string().required().messages({
		"string.base": "walletId must be a string",
		"any.required": "walletId is required",
	}),
})
