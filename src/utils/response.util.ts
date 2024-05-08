import { Response } from "express"
import { StatusCodes } from "http-status-codes"

export function sendSuccessResponse(
	res: Response,
	message: string,
	data: any = {},
	status:
		| StatusCodes.OK
		| StatusCodes.CREATED
		| StatusCodes.ACCEPTED = StatusCodes.OK
) {
	res.status(status).json({
		message,
		data,
	})
}

export function sendErrorResponse(
	res: Response,
	message: string,
	data: any = {},
	status:
		| StatusCodes.BAD_REQUEST
		| StatusCodes.INTERNAL_SERVER_ERROR = StatusCodes.INTERNAL_SERVER_ERROR
) {
	res.status(status).json({
		message,
		data,
	})
}

export const calculatePaginationResponse = (
	limit: number,
	skip: number,
	total: number
) => {
	const page = Math.ceil(skip / limit)
	const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
	return { page, totalPages }
}
