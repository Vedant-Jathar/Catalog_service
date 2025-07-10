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

export interface AuthRequest extends Request {
    auth: {
        sub: string,
        role: string,
        tenantId: string
    }
}