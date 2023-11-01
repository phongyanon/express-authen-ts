export interface IUserSignIn {
    username: string
    password: string
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