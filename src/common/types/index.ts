import { Request } from "express"

export type AuthCookie = {
    accessToken: string
}

export interface AuthenticatedRequest extends Request {
    auth: {
        sub: number,
        role: string
    }
}