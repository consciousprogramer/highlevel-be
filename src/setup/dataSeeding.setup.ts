import TransactionType from "@/models/TransactionType.model.js"
import { v4 } from "uuid"
import logger from "./winston.setup.js"
import { Op } from "sequelize"

export const seedTransactionTypes = async () => {
	const transactionTypes = await TransactionType.bulkCreate([
		{
			id: v4(),
			name: "CREDIT",
			priority: 1,
		},
		{
			id: v4(),
			name: "DEBIT",
			priority: 2,
		},
	])

	logger.info("Default transaction_type created", { transactionTypes })
}

export async function executeSeeding() {
	try {
		const { count } = await TransactionType.findAndCountAll({
			where: {
				name: {
					[Op.in]: "CREDIT DEBIT".split(" "),
				},
			},
		})
		if (count !== 2) {
			await seedTransactionTypes()
		}
	} catch (error) {
		logger.error(error)
	}
}
