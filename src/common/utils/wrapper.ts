import { NextFunction, Request, RequestHandler, Response, } from "express";
import createHttpError from "http-errors";

export const asyncWrapper = (requestHandler: RequestHandler) => {

    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            if (err instanceof Error) {
                next(createHttpError(500, err.message))
            }
            else {
                next(createHttpError(500, "Internal server error"))
            }
        })
    }
}