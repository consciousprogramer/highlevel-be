import { getModelPaginationType } from "@/types/index.js"
import { Transaction } from "@/models/index.js"
import {
	transactionRepository,
	walletRepository,
} from "@/repositories/index.js"
import { calculatePaginationResponse } from "@/utils/response.util.js"
import { s3Client } from "@/setup/index.js"
import { generateTransactionsCSVFileKey } from "@/utils/aws.utils.js"
import { redis } from "@/setup/redis.setup.js"
import {
	addItemToQueue,
	csvGenerationQueueItemUtil,
	generateResourceEventNameString,
	generateResourceQueueNameString,
} from "@/utils/redis.utils.js"
import { REDIS_MESSAGE_DATA } from "@/utils/constants/redis.constants.js"
import jobRecordRepository from "@/repositories/jobRecord.repository.js"
import { JOB_STATUSES } from "@/utils/constants/model.constants.js"
import cluster from "node:cluster"
import { v4 } from "uuid"
import { appConfig } from "@/configs/app.config.js"

export const fetchWalletTransactionsService = async (
	walletId: string,
	paginationData: getModelPaginationType<Transaction>
) => {
	const { limit, skip, sortOn, sortOrder } = paginationData

	const { total, transactions } = await transactionRepository.fetchAndCountAll(
		walletId,
		{
			limit,
			skip,
			sortOn,
			sortOrder,
		}
	)

	const { page, totalPages } = calculatePaginationResponse(limit, skip, total)

	return {
		transactions,
		page,
		limit,
		totalPages,
		totalRowsCount: total,
	}
}

export const fetchATransactionService = async (transactionId: string) => {
	return await transactionRepository.fetchATransaction(transactionId)
}

export const generateTransactionsCSVService = async (walletId: string) => {
	// check if wallet exists
	await walletRepository.findByPk(walletId)

	const workersResourceId = process.env.RESOURCE_ID!

	// generate queue name for resource
	const queueName = generateResourceQueueNameString(workersResourceId)

	const jobRecord = await jobRecordRepository.createJobRecord({
		walletId,
		resourceId: workersResourceId,
		workerId: cluster.isWorker ? cluster.worker?.id! : 0,
	})

	// add the wallet id to the queue
	await addItemToQueue(
		queueName,
		csvGenerationQueueItemUtil.encodeItem(
			jobRecord.id,
			walletId,
			workersResourceId
		)
	)

	// public to this resource consuming worker
	await redis.publish(
		generateResourceEventNameString(workersResourceId),
		REDIS_MESSAGE_DATA.DATA.SOURCE
	)

	return {
		jobRecordId: jobRecord.id,
	}
}

export const checkCsvGenerationJobStatusService = async (
	jobRecordId: string
) => {
	const { data, isCompleted } =
		await jobRecordRepository.checkCsvGenerationJob(jobRecordId)

	if (!isCompleted && !data) {
		return null
	}

	const { result } = data!

	const Location = await s3Client.getSignedUrlPromise("getObject", {
		Bucket: appConfig.s3.setupConfig.bucketName,
		Key: result,
		Expires: appConfig.s3.preferences.csv.preSingedUrlValidity, // min
	})

	return {
		expiresAt: new Date(
			Date.now() + appConfig.s3.preferences.csv.preSingedUrlValidity * 60 * 1000
		).toISOString(),
		csvSingedUrl: Location,
	}
}
