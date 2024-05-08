// import { createClient } from "redis"
// import cluster from "node:cluster"
// import {
// 	generateWorkerEventNameString,
// 	generateWorkerQueueNameString,
// } from "@/utils/redis.utils.js"

// const url = "redis://redis:6379"

// export const publisher = createClient({ url })
// export const subscriber = createClient({ url })

// await publisher.connect()
// await subscriber.connect()

// subscriber.subscribe(
// 	generateWorkerEventNameString(cluster.worker!.id!, process.pid),
// 	() => {}
// )

// subscriber.subscribe(
// 	generateWorkerQueueNameString(cluster.worker!.id!, process.pid),
// 	() => {}
// )
