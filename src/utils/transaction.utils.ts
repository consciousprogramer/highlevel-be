import { appConfig } from "@configs/index.js"
import { TRANSACTION_TYPES } from "@utils/constants/model.constants.js"
import { AppError } from "./customErrors.utils.js"
import { StatusCodes } from "http-status-codes"

export const safeToFixed = (value: number, checkForZero = true) => {
	const splitStr = value.toString().split(".") as [string, string] | [string]

	if (splitStr.length === 2) {
		splitStr[1] = splitStr[1].substring(0, appConfig.PRECISION)
	}

	const fixedDecimalNumber = Number(splitStr.join("."))

	if (checkForZero && fixedDecimalNumber === 0) {
		throw new AppError("value to small", StatusCodes.BAD_REQUEST, false)
	}
	return fixedDecimalNumber
}

/**
 * Performs a precision-safe addition between two numbers.
 *
 * @param {number} n1 - The first number.
 * @param {number} n2 - The second number.
 * @return {number} The result of `n1 + n2` with precision set in config.
 */
export const precisionSafeAdd = (n1: number, n2: number) => {
	return safeToFixed(n1 + n2, false)
}

export const precisionSafeSubstraction = (n1: number, n2: number) => {
	return safeToFixed(n1 - n2, false)
}

export const getTransactionType = (amount: number) => {
	return amount > 0 ? TRANSACTION_TYPES.CREDIT : TRANSACTION_TYPES.DEBIT
}
