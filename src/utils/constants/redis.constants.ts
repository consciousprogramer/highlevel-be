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
export const initialResourceIdPool = [
	"b7137b9c-8b3b-4a6b-a399-8e1bf76b1f4c",
	"e8e4f944-7e1e-4c5d-bb61-ef4d5e7e30bd",
	"d4b42677-7b5c-43b1-9355-8976f379e376",
	"a1fd0f22-511d-4ff5-a4e8-8b1552e1b649",
	"c3d2de57-3cc2-499b-afaf-5b6a289b2d87",
	"f7ee87dc-28a1-498d-9a22-76b7d7c509e5",
	"9f15dc7a-86f6-4ed9-8c79-ae9f87a2f2b1",
	"8a36b7c5-6b88-4f23-a47e-94b2315a7c1a",
]
