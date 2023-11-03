import { JwtPayload } from "jsonwebtoken";

export interface IUserSignIn {
    username: string
    password: string
    info?: string | null
}

export interface IUserSignUp {
    username: string
    password: string
    email: string
}

export interface ISignInResponse {
    access_token: string | null
    refresh_token: string | null
    error?: string
    message?: string
}

export interface ISignOutResponse {
    error?: string
    message: string
}

export interface IAccessTokenPayload {
    uid: string
    username: string
}

export interface IRefreshTokenPayload {
    uid: string
    username: string
}

export interface ITokenMethodResponse {
    success: boolean
    result: string | null
}

export interface IStatusToken {
    status: string
}

export interface IAuthRefreshToken {
    refresh_token: string
}

export interface IAuthRefreshTokenResp {
    access_token: string
    access_token_expires_at: string
    refresh_token: string
    refresh_token_expires_at: string
}

export interface IVerifyToken {
    success: boolean
    result: JwtPayload | null
}
  