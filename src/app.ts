import { config } from "dotenv"
config()
import cluster from "node:cluster"
import os from "node:os"
import { logger } from "@/setup/index.js"

type TWorkerEnv = {
	BIND_PORT: string | number
}

const numCPUs = process.env.NODE_ENV !== "production" ? 2 : os.cpus().length

const MAIN_PORT = parseInt(process.env.PORT || "8080")

const portAccess = new Array<{
	PORT: number
	isActive: boolean
	occupiedBy: number | null
	bindToPort: (PID: number) => void
	transferPort: (NEW_PID: number, PREV_PID: number) => void
}>(numCPUs)
	.fill({
		PORT: MAIN_PORT + 1,
		isActive: false,
		occupiedBy: null,
		bindToPort: function (WID: number) {
			if (!this.isActive) {
				this.occupiedBy = WID
				this.isActive = true
			} else {
				logger.warn(
					`Port ${this.PORT} is already occupied by WID ${this.occupiedBy}`
				)
			}
		},
		transferPort: function (NEW_WID: number, PREV_WID: number) {
			if (this.isActive && this.occupiedBy === PREV_WID) {
				this.occupiedBy = NEW_WID
				this.isActive = true
			} else if (!this.isActive) {
				this.occupiedBy = NEW_WID
				this.isActive = true
				logger.warn(
					`Port ${this.PORT} was not previously occupied by any worker.`,
					{ portAccess }
				)
			} else if (this.occupiedBy !== PREV_WID) {
				logger.warn(
					`Port ${this.PORT} is not occupied by WID ${PREV_WID} instead by ${this.occupiedBy}`,
					{ portAccess }
				)
			}
		},
	})
	.map((item, index) => {
		return {
			...item,
			PORT: item.PORT + index,
		}
	})

const createWorker = (workerEnvData: TWorkerEnv) => {
	const worker = cluster.fork(workerEnvData)

	worker.on("message", (message) => {
		logger.verbose(
			`Message from worker ${worker.id}: ${JSON.stringify(message)}`
		)
	})

	return worker
}

if (cluster.isPrimary) {
	for (let i = 0; i < numCPUs; i++) {
		const portInstance = portAccess[i]
		const worker = createWorker({
			BIND_PORT: portInstance.PORT,
		})
		portInstance.bindToPort(worker.id)
	}

	cluster.on("exit", (worker) => {
		logger.verbose(
			`worker ${worker.id} with process id ${worker.process.pid} died. Starting a new one...`
		)

		const portInstance = portAccess.find(
			(item) => item.occupiedBy === worker.id
		)!
		const newWorker = createWorker({
			BIND_PORT: portInstance.PORT,
		})
		portInstance.transferPort(newWorker.id, worker.id)
	})
} else if (cluster.isWorker) {
	logger.verbose(
		`worker process PID :${process.pid} and worker id ${cluster.worker?.id} started`
	)
}
