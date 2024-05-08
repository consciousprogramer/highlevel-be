import { transactionRepository } from "@/repositories/index.js"
import { walletRepository } from "@/repositories/index.js"
import { precisionSafeAdd } from "@/utils/index.js"
import { sequelizeInstance } from "@/setup/index.js"
import sq from "sequelize"

export const transactService = async (data: {
	walletId: string
	amount: number
	description?: string
}) => {
	// safeFixed already applied to amount in joi
	const { walletId, amount } = data

	const transaction = await sequelizeInstance.transaction({
		isolationLevel: sq.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
	})

	const absAmount = Math.abs(amount)

	try {
		const { balance: latestWalletBalance } = await walletRepository.findByPk(
			walletId,
			{
				attributes: ["balance"],
				raw: true,
				transaction,
			}
		)

		if (amount < 0 && +latestWalletBalance < absAmount) {
			throw new Error(
				`Insufficient balance, You have only ${(+latestWalletBalance).toLocaleString()},\ntried to debit ${absAmount}`
			)
		}

		const updatedBalance = precisionSafeAdd(+latestWalletBalance, amount)

		const [createdTxn, [_, updatedWallet]] = await Promise.all([
			transactionRepository.createTransaction(
				data,
				updatedBalance,
				transaction
			),
			walletRepository.updateWalletAmount(
				absAmount,
				walletId,
				amount < 0 ? "DEBIT" : "CREDIT",
				transaction
			),
		])

		await transaction.commit()
		return {
			updatedBalance: updatedBalance,
			transactionId: createdTxn.id,
		}
	} catch (error) {
		await transaction.rollback()
		throw error
	}
}

export const walletSetupService = async (data: {
	name: string
	balance: number
}) => {
	return await walletRepository.create(data)
}

export const fetchWalletService = async (walletId: string) => {
	return await walletRepository.findByPk(walletId)
}
