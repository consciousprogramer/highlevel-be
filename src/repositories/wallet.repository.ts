import Wallet from "../models/Wallet.model.js"
import {sequelizeInstance} from "../setup/sequelize.setup.js"
import { transactionTypes } from "../types/model.types.js"
import CRUDRepository from "./crud.repository.js"
import sq from "sequelize"

class WalletRepository extends CRUDRepository<Wallet> {
	constructor() {
		super(Wallet, "Wallet")
	}

	async updateWalletAmount(
		amount: number,
		walletId: string,
		action: transactionTypes,
		transaction?: sq.Transaction
	) {
		return await Wallet.update(
			{
				balance: sequelizeInstance.literal(
					`balance ${action === "CREDIT" ? "+" : "-"} ${amount}`
				),
			},
			{
				where: {
					id: walletId,
				},
				transaction,
				returning: true,
			}
		)
	}
}

const walletRepository = new WalletRepository()

export default walletRepository
