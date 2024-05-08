import logger from "@/setup/winston.setup.js"
import { AppError } from "./customErrors.utils.js"
import { StatusCodes } from "http-status-codes"

const redisWorkerEventNamePrefix = process.env.REDIS_WORKER_EVENT_NAME_PREFIX
const redisWorkerQueueNamePrefix = process.env.REDIS_WORKER_QUEUE_NAME_PREFIX

export const generateWorkerEventNameString = (
	workerId: number,
	PID: number
) => {
	if (!redisWorkerEventNamePrefix) {
		logger.error("REDIS_WORKER_EVENT_NAME_PREFIX is not set")
		throw new AppError(
			"REDIS_WORKER_EVENT_NAME_PREFIX is not set",
			StatusCodes.INTERNAL_SERVER_ERROR,
			false
		)
	}
	return `${redisWorkerEventNamePrefix}${workerId}-${PID}`
}
export const generateWorkerQueueNameString = (
	workerId: number,
	PID: number
) => {
	if (!redisWorkerQueueNamePrefix) {
		logger.error("REDIS_WORKER_QUEUE_NAME_PREFIX is not set")
		throw new AppError(
			"REDIS_WORKER_QUEUE_NAME_PREFIX is not set",
			StatusCodes.INTERNAL_SERVER_ERROR,
			false
		)
	}
	return `${redisWorkerQueueNamePrefix}${workerId}-${PID}`
}
