import { Sequelize } from "sequelize"

declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production"

		// Database
		DB_USER: string
		DB_PASS: string
		DB_HOST: string
		DB_PORT: string
		DB_NAME: string

		// App defaults
		PORT: string
		LOG_REQUESTS: "0" | "1" | undefined
	}
}
