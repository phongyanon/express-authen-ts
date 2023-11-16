export interface IResponse {
    error?: string | boolean,
    message? : string
}

export interface ISuccessResponse extends IResponse {
    id?: string
}

export interface IAccessTokenPayload {
    uid: string
    username: string
}

export interface IRefreshTokenPayload {
    uid: string
    username: string
}

export interface ISendMail {
    email_to: string
    subject: string
    text: string
}

export interface ISendMailResp {
    error?: boolean
    success?: boolean
    message: string
}