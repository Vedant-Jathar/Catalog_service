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

export interface getProductsRequest extends Request {
    query: {
        q?: string,
        tenantId?: string,
        categoryId?: string,
        isPublished?: string
    }
}