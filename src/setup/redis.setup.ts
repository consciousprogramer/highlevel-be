import { createClient } from "redis"
import logger from "./winston.setup.js"
import cluster from "node:cluster"
import { REDIS_KEYS } from "@/utils/constants/redis.constants.js"
import { generateResourceEventNameString } from "@/utils/redis.utils.js"
import { generateCsvJob } from "@/jobs/generateCsv.job.js"

const url = "redis://redis:6379"

export const redis = createClient({ url })
export const redisSubscriber = createClient({ url })

await redis.connect()
await redisSubscriber.connect().then(() => {
	if (cluster.isWorker) {
		redisSubscriber.subscribe(
			generateResourceEventNameString(process.env.RESOURCE_ID!),
			(message: string) => {
				logger.info(`CSV generation event received, message ${message}`)
			}
		)
	}
})
