import logger from "@/setup/winston.setup.js"
import { AppError } from "./customErrors.utils.js"
import { StatusCodes } from "http-status-codes"
import { redis } from "@/setup/redis.setup.js"

const redisWorkerEventNamePrefix = process.env.REDIS_CSV_GEN_EVENT_NAME_PREFIX

const redisWorkerQueueNamePrefix = process.env.REDIS_CSV_GEN_QUEUE_NAME_PREFIX

export const generateResourceEventNameString = (resourceId: string) => {
	if (!redisWorkerEventNamePrefix) {
		logger.error("REDIS_CSV_GEN_EVENT_NAME_PREFIX is not set")
		throw new AppError(
			"REDIS_CSV_GEN_EVENT_NAME_PREFIX is not set",
			StatusCodes.INTERNAL_SERVER_ERROR,
			false
		)
	}
	return `${redisWorkerEventNamePrefix}${resourceId}`
}

export const generateResourceQueueNameString = (resourceId: string) => {
	if (!redisWorkerQueueNamePrefix) {
		logger.error("REDIS_CSV_GEN_QUEUE_NAME_PREFIX is not set")
		throw new AppError(
			"REDIS_CSV_GEN_QUEUE_NAME_PREFIX is not set",
			StatusCodes.INTERNAL_SERVER_ERROR,
			false
		)
	}
	return `${redisWorkerQueueNamePrefix}${resourceId}`
}

export const addItemToQueue = async (queueName: string, value: string) => {
	return redis.rPush(queueName, value)
}

export const getFullQueue = async (queueName: string) => {
	return redis.lRange(queueName, 0, -1)
}

export const csvGenerationQueueItemUtil = {
	encodeItem(jobRecordId: string, walletId: string, resourceId: string) {
		return `${jobRecordId}:${walletId}:${resourceId}`
	},
	decodeItem(queueItem: string) {
		const [jobRecordId, walletId, resourceId] = queueItem.split(":")
		if (!jobRecordId || !walletId || !resourceId)
			throw new AppError(
				"Invalid queue item",
				StatusCodes.INTERNAL_SERVER_ERROR,
				false
			)
		return {
			jobRecordId,
			walletId,
			resourceId,
		}
	},
}
