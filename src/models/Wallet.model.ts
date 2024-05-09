import { DataTypes, ForeignKey, Model } from "sequelize"
import { sequelizeInstance } from "../setup/sequelize.setup.js"
import Transaction from "./Transaction.model.js"
import { appConfig } from "../configs/index.js"

export interface IWalletAttributes {
	id: string
	name: string
	balance: string
	// lastCsvGenTxnId: ForeignKey<string> // FK to Transaction
	createdAt: Date
	updatedAt: Date
}

export interface IWalletCreateAttributes {
	id: string
	name: string
	balance?: number
}

const { PRECISION } = appConfig

class Wallet extends Model<IWalletAttributes, IWalletCreateAttributes> {
	declare id: string
	declare name: string
	declare balance: string
	// declare lastCsvGenTxnId: ForeignKey<string>
	declare createdAt: Date
	declare updatedAt: Date
}

Wallet.init(
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [2, 255],
			},
		},
		balance: {
			type: DataTypes.DECIMAL(20, PRECISION),
			defaultValue: 0.0,
			validate: {
				isNumeric: {
					msg: "balance must be a number",
				},
				isDecimal: {
					msg: "amount must be a decimal number",
				},
			},
		},
		createdAt: {
			type: DataTypes.DATE,
			field: "created_at",
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			field: "updated_at",
		},
	},
	{
		sequelize: sequelizeInstance,
		modelName: "wallet",
		tableName: "wallet",
		indexes: [
			{
				fields: ["created_at"],
			},
		],
	}
)

Transaction.belongsTo(Wallet, {
	foreignKey: {
		name: "walletId",
		field: "wallet_id",
		allowNull: false,
	},
	foreignKeyConstraint: true,
})

Wallet.hasMany(Transaction, {
	foreignKey: {
		name: "walletId",
		field: "wallet_id",
		allowNull: false,
	},
	foreignKeyConstraint: true,
})

export default Wallet
