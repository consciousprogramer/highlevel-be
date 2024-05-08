import Joi from "joi"

export const envValidationSchema = Joi.object({
	NODE_ENV: Joi.string().valid("development", "production").required(),

	// Database
	DB_USER: Joi.string().required(),
	DB_PASS: Joi.string().required(),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number()
		.port() // Ensure valid port number
		.required(),
	DB_NAME: Joi.string().required(),

	// Server defaults
	PORT: Joi.number().port().required(),
	LOG_REQUESTS: Joi.string()
		.valid("0", "1") // Allow only specific values
		.default("0"), // Set default
})

export const dbValidationSchema = Joi.object<{
	DB_USER: string
	DB_PASS: string
	DB_HOST: string
	DB_PORT: number
	DB_NAME: string
}>({
	DB_USER: Joi.string().alphanum().required().messages({
		"string.alphanum": "DB_USER must be alphanumeric",
		"string.base": "DB_USER must be a string",
		"any.required": "DB_USER is required",
	}),
	DB_PASS: Joi.string().required().messages({
		"any.required": "DB_PASS is required",
		"string.base": "DB_PASS must be a string",
	}),
	DB_HOST: Joi.string().hostname().required().messages({
		"string.base": "DB_HOST must be a string",
		"string.hostname": "DB_HOST must be a valid hostname",
		"any.required": "DB_HOST is required",
	}),
	DB_PORT: Joi.number()
		.integer()
		.min(10)
		.port() // Ensure valid port number
		.required()
		.messages({
			"number.base": "DB_PORT must be a number",
			"number.integer": "DB_PORT must be an integer",
			"number.min": "DB_PORT must be greater than or equal to 10",
			"any.required": "DB_PORT is required",
		}),
	DB_NAME: Joi.string().alphanum().required().messages({
		"string.alphanum": "DB_NAME must be alphanumeric",
		"string.base": "DB_NAME must be a string",
		"any.required": "DB_NAME is required",
	}),
})
