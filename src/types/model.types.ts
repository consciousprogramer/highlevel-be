import { Attributes, Model } from "sequelize"
import {
	SORT_ORDER,
	TRANSACTION_TYPES,
} from "../utils/constants/model.constants.js"

export type getModelUpdateType<T extends Model> = {
	[K in keyof Attributes<T>]?: any
}

export type getModelSortingKeysType<T extends Model> = keyof Attributes<T>

export type getModelSortOrderType = (typeof SORT_ORDER)[keyof typeof SORT_ORDER]

export type getModelPaginationType<T extends Model> = {
	limit: number
	skip: number
	sortOn: getModelSortingKeysType<T>
	sortOrder: getModelSortOrderType
}

export type getModelSearchType<T extends Model> = {
	field: keyof Attributes<T>
	query: string | number
}

export type transactionTypes =
	(typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES]
