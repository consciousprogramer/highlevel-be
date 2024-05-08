import { AppError, RepositoryError } from "@/utils/customErrors.utils.js"
import { ErrorRequestHandler } from "express"
import { StatusCodes } from "http-status-codes"
import logger from "./winston.setup.js"
import {
	ValidationError,
	DatabaseError,
	UniqueConstraintError,
	BaseError,
	QueryError,
} from "sequelize"

export const expressErrorHandler: ErrorRequestHandler = (
	error,
	req,
	res,
	next
) => {
	logger.error("ERROR : >> ", error)

	if (error instanceof AppError) {
		const errorResponseObject = {
			message: error.message,
			data: {},
		}
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json(errorResponseObject)
	}

	if (error instanceof Error) {
		return res.status(500).json({
			message: error.message,
			data: {},
		})
	}

	return res
		.status(500)
		.json({ success: false, message: "Internal server error", data: {} })
}

function createRepositoryErrorFromSequelizeError(
	error: BaseError | (BaseError & { code: number | string }),
	modelName: string
): RepositoryError | void {
	if (!(error instanceof BaseError)) {
		return
	}

	if (error instanceof ValidationError)
		return new RepositoryError(
			error.message,
			StatusCodes.BAD_REQUEST,
			modelName
		)

	if (error instanceof UniqueConstraintError)
		return new RepositoryError(error.message, StatusCodes.CONFLICT, modelName)

	return new RepositoryError(
		"",
		// @ts-ignore
		error?.code ?? getHttpStatusCode(error),
		modelName
	)
}

function getHttpStatusCode(
	sequelizeError: any & { code: number | string }
): number {
	switch (sequelizeError.code) {
		case "ER_DUP_ENTRY":
			return StatusCodes.CONFLICT 
		case "ER_NO_REFERENCED_ROW_2":
		case "ER_ROW_IS_REFERENCED_2":
			return StatusCodes.NOT_FOUND
		default:
			return StatusCodes.INTERNAL_SERVER_ERROR 
	}
}
