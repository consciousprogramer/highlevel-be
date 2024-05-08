import { DataTypes, ForeignKey, Model } from "sequelize"
import { sequelizeInstance } from "../setup/sequelize.setup.js"
import { ITransactionType } from "./Transaction.model.js"
import { TRANSACTION_TYPES } from "@/utils/index.js"

export interface ITransactionTypeAttributes {
	id: string
	name: ITransactionType
	priority: number
	createdAt: Date
}

export interface ITransactionTypeCreateAttributes {
	id: string
	name: ITransactionType
	priority: number
}

class TransactionType extends Model<
	ITransactionTypeAttributes,
	ITransactionTypeCreateAttributes
> {
	declare id: string
	declare name: ITransactionType
	declare priority: number
	declare createdAt: Date
}

TransactionType.init(
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				isAlpha: {
					msg: "TransactionType id can contain letters only",
				},
				isIn: {
					args: [Object.values(TRANSACTION_TYPES)],
					msg: `TransactionType name must be one of ${Object.values(
						TRANSACTION_TYPES
					).join(",")}`,
				},
			},
		},
		priority: {
			type: DataTypes.INTEGER.UNSIGNED,
			unique: true,
			allowNull: false,
			validate: {
				isInt: {
					msg: "TransactionType priority must be an non-negative integer",
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
		modelName: "transaction_type",
		updatedAt: false,
		tableName: "transaction_type",
	}
)

export default TransactionType
