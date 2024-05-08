import { appConfig } from "@/configs/app.config.js"
import Joi, { func } from "joi"
import { isFloat32Array } from "node:util/types"

export const walletSetupBodySchema = Joi.object({
	name: Joi.string().min(2).max(255).required(),
	balance: Joi.number().min(0),
})

export const transactBodySchema = Joi.object<{
	amount: number
	description?: string
}>({
	amount: Joi.number()
		.custom((value, helpers) => {
			// limit the decimal places
			// toFixed in not suitable
			const splitStr = value.toString().split(".") as
				| [string, string]
				| [string]

			if (splitStr.length === 2) {
				splitStr[1] = splitStr[1].substring(0, appConfig.PRECISION)
			}

			const fixedDecimalNumber = Number(splitStr.join("."))

			if (fixedDecimalNumber === 0) {
				return helpers.error("number.min")
			}
			return fixedDecimalNumber
		})
		.required()
		.messages({
			"number.base": "amount must be a number",
			"number.min":
				"amount too small try with a some higher value with less than 4 decimal places",
			"any.required": "amount is required",
		}),
	description: Joi.string().min(2).max(255).messages({
		"string.base": "description must be a string",
		"string.min": "description must be at least 2 characters long",
		"string.max": "description must be at most 255 characters long",
		"any.required": "description is required",
	}),
})

export const fetchWalletParamsSchema = Joi.object({
	walletId: Joi.string().required().messages({
		"string.base": "walletId must be a string",
		"any.required": "walletId is required",
	}),
})
