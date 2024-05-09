import { config } from "dotenv"
config()
import cluster from "node:cluster"
import os from "node:os"
import { logger } from "@/setup/index.js"
import { ClusterManager, portManager } from "./utils/cluster.util.js"

type TWorkerEnv = {
	BIND_PORT: string | number
	RESOURCE_ID: string
}

const numCPUs = process.env.NODE_ENV !== "production" ? 3 : os.cpus().length

const MAIN_PORT = parseInt(process.env.PORT || "8080")

if (cluster.isPrimary) {
	const portManagerInstance = portManager(numCPUs, MAIN_PORT)
	const clusterManagerInstance = new ClusterManager(numCPUs)

	for (let i = 0; i < numCPUs; i++) {
		const portInstance = portManagerInstance[i]
		const resourceId = clusterManagerInstance.getAResourceIdWithIndex(i)

		const worker = cluster.fork({
			BIND_PORT: portInstance.PORT,
			RESOURCE_ID: resourceId,
		})

		clusterManagerInstance.addResourceAllocationEntry(worker.id, resourceId)
		portInstance.bindToPort(worker.id)
	}

	cluster.on("exit", (worker) => {
		logger.verbose(
			`worker ${worker.id} with process id ${worker.process.pid} died. Starting a new one...`
		)

		const workersResourceId = clusterManagerInstance.getWorkerResourceId(
			worker.id
		)

		// TODO: Think about this case
		if (!workersResourceId) {
			logger.error(`Could not find resource id for worker ${worker.id}`)
		}

		const portInstance = portManagerInstance.find(
			(item) => item.occupiedBy === worker.id
		)!

		const newWorker = cluster.fork({
			BIND_PORT: portInstance.PORT,
			RESOURCE_ID: workersResourceId!,
		})

		clusterManagerInstance.addResourceAllocationEntry(
			newWorker.id,
			workersResourceId!
		)
		portInstance.transferPort(newWorker.id, worker.id)
	})
} else if (cluster.isWorker) {
	logger.verbose(
		`worker process PID :${process.pid} and worker id ${cluster.worker?.id} started`
	)
}
