import { NextFunction, Request, Response } from "express"

export type IWithWalletRequestHandler<
	Params = any,
	ResBody = any,
	ReqBody = any,
	Query = any
> = (
	req: Request<Params, ResBody, ReqBody, Query>,
	res: Response<
		any,
		{
			walletId: string
		}
	>,
	next: NextFunction
) => any
