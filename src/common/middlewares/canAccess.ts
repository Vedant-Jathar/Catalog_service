import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"
import { AuthenticatedRequest } from "../types"

export const canAcces = (rolesArr: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const role = (req as AuthenticatedRequest).auth.role

        if (!rolesArr.includes(role)) {
            next(createHttpError(403, "Forbidden from usage"))
            return
        }
        next()
    }
}
