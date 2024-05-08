import Transaction from "../models/Transaction.model.js"
import CRUDRepository from "./crud.repository.js"
import { RepositoryError } from "../utils/customErrors.utils.js"
import { StatusCodes } from "http-status-codes"
import TransactionType from "../models/TransactionType.model.js"
import { getTransactionType } from "../utils/transaction.utils.js"
import { appConfig } from "../configs/index.js"
import sq from "sequelize"
import {
	getModelSortingKeysType,
	getModelSortOrderType,
} from "../types/model.types.js"
import logger from "@/setup/winston.setup.js"
// interface

class TransactionRepository extends CRUDRepository<Transaction> {
	constructor() {
		super(Transaction, "Transaction")
	}

	async fetchATransaction(id: string) {
		const result = await this.findByPk(id, {
			include: [
				{
					model: TransactionType,
					attributes: ["id", "name"],
				},
			],
			nest: true,
		})

		return result
	}

	async fetchAndCountAll(
		walletId: string,
		paginationData: {
			limit: number
			skip: number
			sortOn: getModelSortingKeysType<Transaction>
			sortOrder: getModelSortOrderType
		}
	) {
		const { limit, skip, sortOn, sortOrder } = paginationData
		const { rows: transactions, count: total } =
			await this.model.findAndCountAll({
				where: {
					walletId,
				},
				limit,
				offset: skip,
				order: [[sortOn, sortOrder]],
				raw: true,
			})
		return { transactions, total }
	}

	async createTransaction(
		data: {
			walletId: string
			amount: number
			description?: string
		},
		updatedBalance: number,
		transaction: sq.Transaction
	) {
		const result = await this.create(
			{
				...data,
				type: getTransactionType(data.amount),
				closingBalance: +updatedBalance.toFixed(appConfig.PRECISION),
			},
			{
				transaction,
				raw: true,
				returning: true,
			},
			"id"
		)
		return result
	}

	async fetchWalletTransactions(
		walletId: string,
		paginationData: {
			limit: number
			skip: number
		}
	) {
		const { limit, skip } = paginationData
		return await this.model.findAll({
			where: {
				walletId,
			},
			limit,
			offset: skip,
			raw: true,
			order: [["createdAt", "DESC"]],
		})
	}
}

const transactionRepository = new TransactionRepository()

export default transactionRepository
