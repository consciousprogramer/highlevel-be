import { redis } from "@/setup/redis.setup.js"
import logger from "@/setup/winston.setup.js"
import { v4 } from "uuid"
import {
	REDIS_KEYS,
	initialResourceIdPool,
} from "./constants/redis.constants.js"

export const portManager = (numCPUs: number, MAIN_PORT: number) => {
	return new Array<{
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
						`Port ${this.PORT} was not previously occupied by any worker.`
					)
				} else if (this.occupiedBy !== PREV_WID) {
					logger.warn(
						`Port ${this.PORT} is not occupied by WID ${PREV_WID} instead by ${this.occupiedBy}`
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
}

export class ClusterManager {
	numCPUs: number
	initialWorkerForkingDone = false
	resourceIds: string[] = []
	workerIdToResourceIdMap = new Map<number, string>()
	resourceIdToWorkerIdMap = new Map<string, number | null>()

	constructor(numCPUs: number) {
		this.numCPUs = numCPUs

		// at the end of the constructor
		this.init()
	}

	private async init() {
		this.resourceIds = initialResourceIdPool.slice(0, this.numCPUs)
		this.resourceIds.forEach((resourceId) => {
			this.resourceIdToWorkerIdMap.set(resourceId, null)
		})
		await this.createRedisLocks()
	}

	private spinUpRedisQueues() {
		// not needed
	}

	private async createRedisLocks() {
		await redis.hSet(
			REDIS_KEYS.HASH.LOCKS,
			this.resourceIds
				.map((resourceId) => [resourceId, "false"])
				.flatMap((item) => item)
		)
		logger.verbose("Redis locks created")
	}

	getAResourceIdWithIndex(index: number) {
		return this.resourceIds[index]
	}

	addResourceAllocationEntry(workerId: number, resourceId: string) {
		this.workerIdToResourceIdMap.set(workerId, resourceId)
		this.resourceIdToWorkerIdMap.set(resourceId, workerId)
	}

	getWorkerResourceId(workerId: number) {
		return this.workerIdToResourceIdMap.get(workerId)
	}

	getResourceWorkerId(resourceId: string) {
		return this.resourceIdToWorkerIdMap.get(resourceId)
	}
}
