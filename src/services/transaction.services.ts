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


	// TODO: May need to add logic to check if csv already generated
	// but not sure, in development every time is better i guess
	const fastCsvWriteStream = fastCsv.format({
		headers: true,
	})

	const csvBodyStream = new stream.PassThrough()

	// no need to worry about backpressure, pipe handles it automatically
	fastCsvWriteStream.pipe(csvBodyStream)

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
		transactionsBatch.forEach((transaction) => {
			fastCsvWriteStream.write(transaction)
		})
	}

	fastCsvWriteStream.end()

	const s3CSVKey = generateTransactionsCSVFileKey(walletId)
	const { Key } = await s3Client
		.upload({
			Bucket: bucketName,
			Key: s3CSVKey,
			Body: csvBodyStream,
			ContentType: "text/csv",
		})
		.promise()

	const Location = await s3Client.getSignedUrlPromise("getObject", {
		Bucket: bucketName,
		Key,
		Expires: 60, // min
	})

	return {
		expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
		csvSingedUrl: Location,
	}
}
