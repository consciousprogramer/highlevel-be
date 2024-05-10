export const REDIS_KEYS = {
	HASH: {
		LOCKS: "LOCKS",
	},
	QUEUE: {
		CSV_GENERATION_RETRY_QUEUE: "CSV_GENERATION_RETRY_QUEUE",
	},
}

export const REDIS_MESSAGE_DATA = {
	DATA: {
		SOURCE: JSON.stringify({
			source: "SOURCE",
		}),
		JOB_END: JSON.stringify({
			source: "JOB_END",
		}),
	},
}

export const resourceIdPrefix = "resource-"
