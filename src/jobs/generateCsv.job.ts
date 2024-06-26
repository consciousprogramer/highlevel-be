import JobRecord from "@/models/JobRecord.model.js"
import transactionRepository from "@/repositories/transaction.repository.js"
import s3Client, { bucketName } from "@/setup/awsS3.setup.js"
import { redis } from "@/setup/redis.setup.js"
import { sequelizeInstance } from "@/setup/sequelize.setup.js"
import logger from "@/setup/winston.setup.js"
import { TJobEventData } from "@/types/job.types.js"
import { generateTransactionsCSVFileKey } from "@/utils/aws.utils.js"
import { JOB_STATUSES } from "@/utils/constants/model.constants.js"
import SQ from "sequelize"
import {
	REDIS_KEYS,
	REDIS_MESSAGE_DATA,
} from "@/utils/constants/redis.constants.js"
import {
	csvGenerationQueueItemUtil,
	generateResourceEventNameString,
	generateResourceQueueNameString,
} from "@/utils/redis.utils.js"
import * as fastCsv from "fast-csv"
import stream from "node:stream"

export const generateCsvJob = async (eventMessageData: string) => {
	let queueItem: string | null = null
	const jobStartTime = Date.now()
	const resourceId = process.env.RESOURCE_ID!

	try {
		const { source } = JSON.parse(eventMessageData) as TJobEventData

		logger.debug(`🔥CSV generation event received`)
		logger.debug(eventMessageData)

		const lockStatus = await redis.hGet(REDIS_KEYS.HASH.LOCKS, resourceId)

		const isAnotherJobRunning = JSON.parse(lockStatus ?? "false")

		// check what is the source of the event
		if (source === "SOURCE" && isAnotherJobRunning) {
			logger.error(
				"Another csv generation job running for this resource, exiting."
			)
			return
		}

		const queueName = generateResourceQueueNameString(resourceId)

		// get the least recent item from the queue
		queueItem = (await redis.LINDEX(queueName, -1))!

		if (queueItem) {
			// start new Job, and update lock status (acquired lock)
			// TODO: Race condition can happen, add handling logic
			await redis.hSet(REDIS_KEYS.HASH.LOCKS, resourceId, "true")
		} else {
			// No item in the queue, job will stop running now
			await redis.hSet(REDIS_KEYS.HASH.LOCKS, resourceId, "false")

			logger.warn("no wallet in in the queue.")
			return
		}

		const { jobRecordId, walletId } =
			csvGenerationQueueItemUtil.decodeItem(queueItem)

		if (!walletId) {
			return console.warn("No market in the completed market queue.")
		}

		// each wallet can have multiple jobs
		const job = await JobRecord.findOne({
			where: {
				id: jobRecordId,
				walletId: walletId,
			},
			raw: true,
		})

		if (!job) {
			// TODO: throw error
			new Error(`Job with id ${jobRecordId} not found`)
		}

		// TODO: May need to add logic to check if csv already generated
		// but not sure, in development every time is better i guess
		const fastCsvWriteStream = fastCsv.format({
			headers: true,
		})

		const csvBodyStream = new stream.PassThrough()

		// no need to worry about backpressure, pipe handles it automatically
		fastCsvWriteStream.pipe(csvBodyStream)

		// setup the async iterator
		const walletTransactionsIterator = {
			perPage: 50,
			currentPage: 1,
			hasNextPage: true,
			[Symbol.asyncIterator]: async function* () {
				while (this.hasNextPage) {
					const transactions =
						await transactionRepository.fetchWalletTransactions(walletId, {
							limit: this.perPage,
							skip: (this.currentPage - 1) * this.perPage,
						})
					if (transactions.length < this.perPage) {
						this.hasNextPage = false
					}
					this.currentPage++
					yield transactions
				}
			},
		}

		for await (const transactionsBatch of walletTransactionsIterator) {
			// TODO: optimize later, write the whole batch at once
			transactionsBatch.forEach((transaction) => {
				fastCsvWriteStream.write(transaction)
			})
		}

		fastCsvWriteStream.end()

		const s3CSVKey = generateTransactionsCSVFileKey(walletId)

		const { Key } = await s3Client
			.upload({
				Bucket: bucketName,
				Key: `JOB/${s3CSVKey}`,
				Body: csvBodyStream,
				ContentType: "text/csv",
			})
			.promise()

		// ===============================[ JOB COMPLETED ]============================

		const txn = await sequelizeInstance.transaction({
			isolationLevel: SQ.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
		})

		try {
			await Promise.all([
				JobRecord.update(
					{
						status: JOB_STATUSES.COMPLETED,
						result: JSON.stringify({ Key: Key }),
					},
					{
						where: {
							id: jobRecordId,
							status: JOB_STATUSES.STARTED,
						},
					}
				),
			])

			await txn.commit()
		} catch (error) {
			await txn.rollback()
			throw error
		}

		// update the lock status as false (released)
		await redis.hSet(REDIS_KEYS.HASH.LOCKS, resourceId, "false")

		// remove the last item from the queue
		const poppedMarketId = await redis.rPop(queueName)

		const { jobRecordId: popedJobRecordId } =
			csvGenerationQueueItemUtil.decodeItem(poppedMarketId!)

		// both should match as they are same
		if (poppedMarketId !== jobRecordId) {
			// TODO: throw error
			logger.error(
				`Poped job id ${popedJobRecordId} does not match with job id ${jobRecordId}`
			)
			new Error(`Job with id ${jobRecordId} not found`)
		}

		logger.verbose(
			`Completed csv generation for walletId : ${walletId} in ${
				Date.now() - jobStartTime
			} ms ✅`
		)

		// proceed to process next item
		await redis.publish(
			generateResourceEventNameString(resourceId),
			REDIS_MESSAGE_DATA.DATA.JOB_END
		)
	} catch (error) {
		// stop the job
		const redisTxn = redis.multi()
		redisTxn.hSet(REDIS_KEYS.HASH.LOCKS, resourceId, "false")
		if (queueItem) {
			redisTxn.lPush(REDIS_KEYS.QUEUE.CSV_GENERATION_RETRY_QUEUE, queueItem)
		}
		redisTxn.exec()

		logger.error(error)

		await redis.publish(
			generateResourceEventNameString(resourceId),
			REDIS_MESSAGE_DATA.DATA.JOB_END
		)
	}
}
