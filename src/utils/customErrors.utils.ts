import { StatusCodes } from "http-status-codes"
import {
	Attributes,
	Model,
	WhereAttributeHash,
	WhereAttributeHashValue,
} from "sequelize"
import Wallet from "../models/Wallet.model.js"

export class AppError extends Error {
	isOperational: boolean
	httpStatusCode: StatusCodes

	constructor(message: string, httpStatusCode = 500, isOperational: boolean) {
		super(message)
		this.httpStatusCode = httpStatusCode
		this.isOperational = isOperational
		Error.captureStackTrace(this, this.constructor)
	}
}

export class RepositoryError extends AppError {
	modelName: string
	data: Record<string, any> = {}

	constructor(
		message: string,
		httpStatusCode = 500,
		modelName: string,
		isOperational = true,
		data = {}
	) {
		super(message, httpStatusCode, isOperational)
		this.modelName = modelName
		this.name = "RepositoryError"
		if (this.data) this.data = data
	}

	// save error message
	// this.message = this.generateRepositoryErrorMessage()
	// private generateRepositoryErrorMessage() {
	// 	return `cannot ${this.action} ${this.modelName} with ${JSON.stringify(
	// 		this.identifiers
	// 	)}`
	// }
}
