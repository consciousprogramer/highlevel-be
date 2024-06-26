export const INTEGRITY_ACTIONS = Object.freeze({
	CASCADE: "CASCADE",
	SET_NULL: "SET NULL",
	NO_ACTION: "NO ACTION",
	RESTRICT: "RESTRICT",
	SET_DEFAULT: "SET DEFAULT",
})

export const TRANSACTION_TYPES = Object.freeze({
	CREDIT: "CREDIT",
	DEBIT: "DEBIT",
})

export const SORT_ORDER = Object.freeze({
	ASC: "ASC",
	DESC: "DESC",
})

export const JOB_STATUSES = Object.freeze({
	PUSHED: "PUSHED",
	STARTED: "STARTED",
	COMPLETED: "COMPLETED",
	ERRORED: "ERRORED",
})

export const JOB_TYPES = Object.freeze({
	CSV_GENERATION: "CSV_GENERATION",
})
