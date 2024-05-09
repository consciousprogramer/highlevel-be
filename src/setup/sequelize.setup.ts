import { Sequelize } from "sequelize"
import logger, { errorLogger } from "./winston.setup.js"
import { dbValidationSchema } from "@/validation/index.js"

const { error, value, warning } = dbValidationSchema.validate({
	DB_USER: process.env.DB_USER,
	DB_PASS: process.env.DB_PASS,
	DB_HOST: process.env.DB_HOST,
	DB_PORT: process.env.DB_PORT,
	DB_NAME: process.env.DB_NAME,
})

if (error) {
	errorLogger.error(error)
	throw error
}

if (warning) {
	logger.warn(warning)
}

export let sequelizeInstance = new Sequelize({
	dialect: "mysql",
	username: value.DB_USER,
	password: value.DB_PASS,
	host: value.DB_HOST,
	port: value.DB_PORT,
	database: value.DB_NAME,
	logging: false,
	pool: {
		evict: 30_000,
		idle: 30_000,
		max: 4,
		min: 0,
	},
	timezone: "+05:30", // TODO: set/check for the same on EC2, RDS and S3 also.
	dialectOptions:
		process.env.NODE_ENV === "production"
			? {
					ssl: {
						require: true,
						rejectUnauthorized: false,
					},
				}
			: undefined,
})

export const setSequelizeInstance = (sequelize: Sequelize) => {
	sequelizeInstance = sequelize
}

export const syncDB = async () => {
	if (!sequelizeInstance) {
		throw new Error("Sequelize instance not set")
	}
	await sequelizeInstance.sync()

	logger.info("Database synced ✅")
}

// sequelizeInstance.authenticate().then(syncDB)

export const initSequelize = () => {
	const { error, value, warning } = dbValidationSchema.validate({
		DB_USER: process.env.DB_USER,
		DB_PASS: process.env.DB_PASS,
		DB_HOST: process.env.DB_HOST,
		DB_PORT: process.env.DB_PORT,
		DB_NAME: process.env.DB_NAME,
	})

	if (error) {
		errorLogger.error(error)
		throw error
	}

	if (warning) {
		logger.warn(warning)
	}

	const sequelize = new Sequelize({
		dialect: "mysql",
		username: value.DB_USER,
		password: value.DB_PASS,
		host: value.DB_HOST,
		port: value.DB_PORT,
		database: value.DB_NAME,
		logging: false,
		pool: {
			evict: 30_000,
			idle: 30_000,
			max: 4,
			min: 0,
		},
		timezone: "+05:30", // TODO: set/check for the same on EC2, RDS and S3 also.
		dialectOptions:
			process.env.NODE_ENV === "production"
				? {
						ssl: {
							require: true,
							rejectUnauthorized: false,
						},
					}
				: undefined,
	})

	setSequelizeInstance(sequelize)

	return sequelize
}

// initSequelize()
