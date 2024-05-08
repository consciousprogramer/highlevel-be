import { DataTypes, ForeignKey, Model } from "sequelize"
import { sequelizeInstance } from "@setup/index.js"
import TransactionType from "./TransactionType.model.js"
import { TRANSACTION_TYPES } from "@utils/index.js"
import { appConfig } from "@configs/index.js"

export type ITransactionType =
	(typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES]

export interface ITransactionAttributes {
	id: string
	walletId: ForeignKey<string>
	type: ForeignKey<ITransactionType>
	amount: string
	description: string
	closingBalance: string
	createdAt: Date
}

export interface ITransactionCreateAttributes {
	id: string
	walletId: ForeignKey<string>
	type: ForeignKey<ITransactionType>
	amount: number
	description?: string
	closingBalance: number
}

const { PRECISION } = appConfig

class Transaction extends Model<
	ITransactionAttributes,
	ITransactionCreateAttributes
> {
	declare id: string
	declare walletId: ForeignKey<string>
	declare type: ForeignKey<ITransactionType>
	declare amount: string
	declare description: string
	declare closingBalance: string
	declare createdAt: Date
}

Transaction.init(
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [0, 255],
			},
		},
		amount: {
			type: DataTypes.DECIMAL(20, PRECISION),
			allowNull: false,
			validate: {
				isNumeric: {
					msg: "amount must be a number",
				},
				isDecimal: {
					msg: "amount must be a decimal number",
				},
			},
		},
		closingBalance: {
			type: DataTypes.DECIMAL(20, PRECISION),
			allowNull: false,
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
	},
	{
		sequelize: sequelizeInstance,
		modelName: "transaction",
		tableName: "transaction",
		updatedAt: false,
		indexes: [
			{
				fields: ["wallet_id"],
			},
			{
				fields: ["type"],
			},
			{
				fields: ["amount"],
			},
		],
	}
)

Transaction.belongsTo(TransactionType, {
	foreignKey: {
		name: "type",
		field: "type",
		allowNull: false,
	},
	targetKey: "name",
	foreignKeyConstraint: true,
})

TransactionType.hasMany(Transaction, {
	foreignKey: {
		name: "type",
		field: "type",
		allowNull: false,
	},
	sourceKey: "name",
	foreignKeyConstraint: true,
})

export default Transaction
