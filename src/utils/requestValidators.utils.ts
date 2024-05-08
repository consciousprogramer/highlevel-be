// requestValidator.util.ts START
import { RequestHandler } from "express"
import Joi from "joi"

export const paramsBodyQueryValidator = <P, B, Q>(
	paramsValidationSchema: Joi.ObjectSchema<P>,
	bodyValidationSchema: Joi.ObjectSchema<B>,
	queryValidationSchema: Joi.ObjectSchema<Q>
): RequestHandler<P, any, B, Q> => {
	return async (req, res, next) => {
		try {
			req.params = await paramsValidationSchema.validateAsync(req.params)
			req.body = await bodyValidationSchema.validateAsync(req.body)
			req.query = await queryValidationSchema.validateAsync(req.query)
			next()
		} catch (error) {
			next(error)
		}
	}
}

export const paramsBodyValidator = <P, B>(
	paramsValidationSchema: Joi.ObjectSchema<P>,
	bodyValidationSchema: Joi.ObjectSchema<B>
): RequestHandler<P, any, B> => {
	return async (req, res, next) => {
		try {
			req.params = await paramsValidationSchema.validateAsync(req.params)
			req.body = await bodyValidationSchema.validateAsync(req.body)
			next()
		} catch (error) {
			next(error)
		}
	}
}

export const paramsValidator = <P>(
	paramsValidationSchema: Joi.ObjectSchema<P>
): RequestHandler<P> => {
	return async (req, res, next) => {
		try {
			req.params = await paramsValidationSchema.validateAsync(req.params)
			next()
		} catch (error) {
			next(error)
		}
	}
}
export const bodyValidator = <B>(
	bodyValidationSchema: Joi.ObjectSchema<B>
): RequestHandler<any, any, B> => {
	return async (req, res, next) => {
		try {
			req.body = await bodyValidationSchema.validateAsync(req.body)
			next()
		} catch (error) {
			next(error)
		}
	}
}
export const queryValidator = <Q>(
	queryValidationSchema: Joi.ObjectSchema<Q>
): RequestHandler<any, any, any, Q> => {
	return async (req, res, next) => {
		try {
			req.query = await queryValidationSchema.validateAsync(req.query)
			next()
		} catch (error) {
			next(error)
		}
	}
}

// requestValidator.util.ts ENDS
