export interface IResponse {
    error?: string | boolean,
    message? : string
}

export interface ISuccessResponse extends IResponse {
    id?: string
}