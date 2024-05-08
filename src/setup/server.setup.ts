import cluster from "node:cluster"
import express from "express"
import rootRouter from "@/routes/index.js"
import logger from "./winston.setup.js"
import { morganRequestLoggerMiddleware } from "./morgan.setup.js"
import { StatusCodes } from "http-status-codes"
import cors from "cors"
import { expressErrorHandler } from "./errorHandling.setup.js"
import { executeSeeding } from "./dataSeeding.setup.js"

const app = express()

const getServerListenPort = () => {
	return cluster.isPrimary ? process.env.PORT : process.env.BIND_PORT
}

export const initServer = () => {
	app.use(express.json())

	app.use(
		cors({
			allowedHeaders: "*",
			origin: "*",
		})
	)

	app.use(morganRequestLoggerMiddleware)

	app.listen(getServerListenPort(), async () => {
		await executeSeeding()
		if (cluster.isWorker) {
			logger.info(
				`process with pid ${process.pid} listening on port ${getServerListenPort()}`
			)
		} else {
			logger.info(`Server running on PORT :: ${getServerListenPort()}`)
		}

		// await executeSeeding()
	})

	// setup routes
	let workerCount = 0
	const incrementedWorkerCount = () => {
		return ++workerCount
	}
	app.use("/cluster/kill-one-worker/", async (req, res) => {
		if (process.env.NODE_ENV !== "production") {
			const workerCount = incrementedWorkerCount()
			const pid = process.pid
			const killAfterTime = 2_000

			logger.verbose(`Worker ID : ${cluster.worker?.id}`)
			logger.verbose(`Is Primary : ${cluster.isPrimary}`)
			logger.verbose(`Is Worker : ${cluster.isWorker}`)

			logger.verbose(
				`worker  ${workerCount} will be killed after ${killAfterTime}ms`
			)

			res.json({
				PID: pid,
				WID: cluster.worker?.id,
				killAfterTime,
			})

			setTimeout(() => {
				cluster.workers![workerCount]!.kill()
			}, killAfterTime)
		} else {
			res.status(StatusCodes.FORBIDDEN).send("not allowed")
		}
	})

	app.use("/api/v1", rootRouter)

	app.use("/check", (req, res) => {
		console.log("API Health : ok")
		res.send("OK")
	})

	app.use("/", (req, res) => {
		res.send("GHL API Running... ✅")
	})

	app.use(expressErrorHandler)
	// syncDB()
}

initServer()

export default app
