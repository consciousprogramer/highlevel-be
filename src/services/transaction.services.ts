import { getModelPaginationType } from "@/types/index.js"
import { Transaction } from "@/models/index.js"
import {
	transactionRepository,
	walletRepository,
} from "@/repositories/index.js"
import { calculatePaginationResponse } from "@/utils/response.util.js"
import { bucketName, s3Client } from "@/setup/index.js"
import fs from "node:fs"
import stream from "node:stream"
import * as fastCsv from "fast-csv"
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

	// TODO: May need to add logic to check if csv already generated
	// but not sure, in development every time is better i guess

	// ======================[ NOW THIS HAPPENS IN JOB ]=======================

	// const fastCsvWriteStream = fastCsv.format({
	// 	headers: true,
	// })

	// const csvBodyStream = new stream.PassThrough()

	// // no need to worry about backpressure, pipe handles it automatically
	// fastCsvWriteStream.pipe(csvBodyStream)

	// const walletTransactionsIterator = {
	// 	perPage: 50,
	// 	currentPage: 1,
	// 	hasNextPage: true,
	// 	[Symbol.asyncIterator]: async function* () {
	// 		while (this.hasNextPage) {
	// 			const transactions =
	// 				await transactionRepository.fetchWalletTransactions(walletId, {
	// 					limit: this.perPage,
	// 					skip: (this.currentPage - 1) * this.perPage,
	// 				})
	// 			if (transactions.length < this.perPage) {
	// 				this.hasNextPage = false
	// 			}
	// 			this.currentPage++
	// 			yield transactions
	// 		}
	// 	},
	// }

	// for await (const transactionsBatch of walletTransactionsIterator) {
	// 	transactionsBatch.forEach((transaction) => {
	// 		fastCsvWriteStream.write(transaction)
	// 	})
	// }

	// fastCsvWriteStream.end()

	// ======================[ NOW THIS HAPPENS IN JOB ]=======================

	const s3CSVKey = generateTransactionsCSVFileKey(walletId)

	// const { Key } = await s3Client
	// 	.upload({
	// 		Bucket: bucketName,
	// 		Key: s3CSVKey,
	// 		Body: csvBodyStream,
	// 		ContentType: "text/csv",
	// 	})
	// 	.promise()

	const Location = await s3Client.getSignedUrlPromise("getObject", {
		Bucket: bucketName,
		// s3CSVKey,
		Key: `JOB/${s3CSVKey}`,
		Expires: 60, // min
	})

	return {
		expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
		csvSingedUrl: Location,
	}
}
