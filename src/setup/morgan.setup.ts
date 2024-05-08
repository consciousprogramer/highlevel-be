import Morgan from "morgan"
import logger from "./winston.setup.js"
import UAParser from "ua-parser-js"

const MORGAN_FORMATS = {
	PARSED_UA: "PARSED_UA",
}

const parsedUAFormat = Morgan.format(
	MORGAN_FORMATS.PARSED_UA,
	"HTTP/:http-version :method :url  :req-body :status :req-ua"
)

export const morganRequestLoggerMiddleware = Morgan(MORGAN_FORMATS.PARSED_UA, {
	immediate: true,
	stream: {
		write: (message) => logger.http(message),
	},
})

Morgan.token("req-body", (req) => {
	if (req.method === "POST") {
		// @ts-ignore
		return "body: " + JSON.stringify(req.body)
	}
	return ""
})

Morgan.token("req-ua", (req) => {
	const ua = UAParser(req.headers["user-agent"])
	const browser = `${ua.browser.name} ${ua.browser.version}`
	const os = `${ua.os.name} ${ua.os.version}`
	return `${browser} on ${os}`
})
