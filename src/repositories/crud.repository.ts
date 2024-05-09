import {
	Attributes,
	CreationAttributes,
	Identifier,
	Model,
	ModelStatic,
	FindOptions,
	CreateOptions,
	UpdateOptions,
	DestroyOptions,
} from "sequelize"

import { v4 } from "uuid"
import { RepositoryError } from "../utils/customErrors.utils.js"
import { StatusCodes } from "http-status-codes"
import { getModelUpdateType } from "@/types/index.js"
import { logger } from "@/setup/index.js"
import { errorLogger } from "@/setup/winston.setup.js"

// interface crudRepositoryThis<M extends Model> extends ModelStatic<M> {
//   model: M
// }

// export function CRUDRepository<M extends Model>(
//   this: crudRepositoryThis<M>,
//   model: M
// ) {
//   this.model = model

//   this.findByPk = async function (identifier) {
//     const result = await this.model.findByPk(identifier)
//     return result
//   }
// }

// class NonAbstractModel extends Model{}

// const aa = new NonAbstractModel()

// type CRUDRepositoryMethods<M extends Model<any, any>> = Omit<ModelStatic<M>, "">

// class CRUDRepository<M extends Model<any, any>>
//   implements CRUDRepositoryMethods<M>
// {
//   private model: M

//   constructor(model: M) {
//     this.model = model
//   }

//   findByPk(
//     identifier: Identifier,
//     options: Omit<NonNullFindOptions<Attributes<M>>, "where">
//   ): Promise<M> {
//     return Promise.resolve(this.model)
//   }
// }

export default class CRUDRepository<M extends Model<any, any>> {
	model: ModelStatic<M>
	name: string

	constructor(model: ModelStatic<M>, name: string) {
		this.model = model
		this.name = name
	}

	generateUUID() {
		return v4()
	}

	async findByPk(identifier: Identifier, options?: FindOptions<Attributes<M>>) {
		try {
			const result = await this.model.findByPk(identifier, options)
			if (!result) {
				throw new RepositoryError(
					`Could not find ${this.name} with id ${identifier}`,
					StatusCodes.NOT_FOUND,
					this.model.name,
					true
				)
			}
			return result
		} catch (error) {
			if (error instanceof RepositoryError) throw error
			throw new RepositoryError(
				`Cannot find ${this.name}`,
				StatusCodes.NOT_FOUND,
				this.model.name
			)
		}
	}

	async findAll(options?: FindOptions<Attributes<M>>) {
		try {
			const result = await this.model.findAll(options)
			return result!
		} catch (error) {
			throw new RepositoryError(
				`Error during findAll on ${this.name}`,
				StatusCodes.INTERNAL_SERVER_ERROR,
				this.model.name
			)
		}
	}

	async create<IdField extends keyof CreationAttributes<M>>(
		values: Omit<CreationAttributes<M>, IdField>,
		options?: CreateOptions<Attributes<M>>,
		idField: IdField = "id" as IdField
	) {
		try {
			let valuesWithId: CreationAttributes<M>

			if (!idField) {
				valuesWithId = values as CreationAttributes<M>
			} else {
				valuesWithId = {
					...values,
					[idField]: this.generateUUID(),
				} as CreationAttributes<M>
			}
			const result = await this.model.create(valuesWithId, options)
			return result!
		} catch (error) {
			errorLogger.error(error)
			throw new RepositoryError(
				`Error during creation of ${this.name}`,
				StatusCodes.NOT_FOUND,
				this.model.name
			)
		}
	}

	async update(
		values: getModelUpdateType<M>,
		options: UpdateOptions<Attributes<M>>
	) {
		try {
			const result = await this.model.update(values, options)
			return result!
		} catch (error) {
			throw new RepositoryError(
				`Error during update of ${this.name}`,
				StatusCodes.NOT_FOUND,
				this.model.name
			)
		}
	}

	async destroy(options: DestroyOptions<Attributes<M>>) {
		try {
			const result = await this.model.destroy(options)
			return result
		} catch (error) {
			throw new RepositoryError(
				`Error during delete of ${this.name}`,
				StatusCodes.NOT_FOUND,
				this.model.name
			)
		}
	}
}
