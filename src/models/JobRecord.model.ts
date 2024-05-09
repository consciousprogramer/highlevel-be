import { DataTypes, ForeignKey, Model } from "sequelize"
import { sequelizeInstance } from "../setup/sequelize.setup.js"
import { appConfig } from "../configs/index.js"
import { JOB_STATUSES, JOB_TYPES } from "@/utils/constants/model.constants.js"
import Wallet from "./Wallet.model.js"

type TJobsStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES]
type TJobsTypes = (typeof JOB_TYPES)[keyof typeof JOB_TYPES]

export interface IJobRecordAttributes {
	id: string
	walletId: ForeignKey<string>
	resourceId: string
	workerId: number
	status: TJobsStatus
	// type: TJobsStatus
	createdAt: Date
	updatedAt: Date
}

export interface IJobRecordCreateAttributes {
	id: string
	walletId: ForeignKey<string>
	resourceId: string
	workerId: number
	status: TJobsStatus
	// type: TJobsStatus
}

const { PRECISION } = appConfig

class JobRecord extends Model<
	IJobRecordAttributes,
	IJobRecordCreateAttributes
> {
	declare id: string
	declare resourceId: ForeignKey<string>
	declare walletId: string
	declare workerId: number
	declare status: TJobsStatus
	// declare type: TJobsStatus
	declare createdAt: Date
	declare updatedAt: Date
}

JobRecord.init(
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		walletId: {
			type: DataTypes.STRING,
			allowNull: false,
			field: "wallet_id",
			validate: {
				isUUID: {
					args: 4,
					msg: "wallet_id must be a UUID",
				},
			},
		},
		resourceId: {
			type: DataTypes.STRING,
			allowNull: false,
			field: "resource_id",
			validate: {
				isUUID: {
					args: 4,
					msg: "resource_id must be a UUID",
				},
			},
		},
		status: {
			type: DataTypes.ENUM(...Object.values(JOB_STATUSES)),
			allowNull: false,
		},

		workerId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			field: "worker_id",
			validate: {
				min: {
					args: [0],
					msg: "workerId must be greater than equal to 0",
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
		modelName: "job_record",
		tableName: "job_record",
		indexes: [
			{
				fields: ["created_at"],
			},
			{
				fields: ["resource_id"],
			},
			{
				fields: ["status"],
			},
			{
				fields: ["wallet_id"],
			},
		],
	}
)

JobRecord.belongsTo(Wallet, {
	foreignKey: {
		name: "walletId",
		field: "wallet_id",
		allowNull: false,
	},
	foreignKeyConstraint: true,
})

Wallet.hasMany(JobRecord, {
	foreignKey: {
		name: "walletId",
		field: "wallet_id",
		allowNull: false,
	},
	foreignKeyConstraint: true,
})

export default JobRecord
