// import * as winston from "winston"

import winston, { format, silly, verbose } from "winston"

const { colorize, combine, timestamp, printf, json, prettyPrint } = format

const levels = Object.freeze({
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	verbose: 4,
	debug: 5,
	silly: 6,
})

const colors = Object.freeze({
	error: "red",
	warn: "yellow",
	info: "blue",
	http: "magenta",
	verbose: "green",
	debug: "gray",
	silly: "white",
})

winston.addColors(colors)

const winstonTransportOptions: {
	File: winston.transports.FileTransportOptions
	Console: winston.transports.ConsoleTransportOptions
	Http?: winston.transports.HttpTransportOptions
	Stream?: winston.transports.StreamTransportOptions
} = {
	File: {
		level: "info",
		filename: "logs/app.log",
		handleExceptions: true,
		maxsize: 100 * 1024 * 1024, // 100MB
		maxFiles: 3,
		format: combine(
			timestamp({
				format: "DD-MM-YYYY HH:mm:ss:SSS",
			}),
			json()
		),
	},
	Console: {
		level: "debug",
		handleExceptions: true,
		format: combine(
			colorize({
				all: true,
			}),
			timestamp({
				format: "DD-MM-YYYY HH:mm:ss:SSS",
			}),
			printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
		),
	},
}

const logger = winston.createLogger({
	level: "debug",
	levels,
	transports: [new winston.transports.File(winstonTransportOptions.File)],
	exitOnError: false,
})

export const errorLogger = winston.createLogger({
	level: "error",
	levels,
	transports: [
		new winston.transports.Console({
			level: "error",
			handleExceptions: true,
			format: combine(
				colorize({
					level: true,
				}),
				timestamp({
					format: "DD-MM-YYYY HH:mm:ss:SSS",
				}),
				json(),
				prettyPrint({ colorize: true })
			),
		}),
	],
	exitOnError: false,
})

if (process.env.NODE_ENV !== "production") {
	logger.add(new winston.transports.Console(winstonTransportOptions.Console))
}

export default logger
