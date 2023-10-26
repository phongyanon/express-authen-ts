export interface ITokenInsert {
	user_id: string
	refresh_token?: string
	refresh_token_expires_at?: string | null
	reset_password_token?: string | null
	reset_password_token_expires_at?: string | null
	verify_email_token?: string | null
	verify_email_token_expires_at?: string | null
	email_verified?: boolean
	enable_opt?: boolean
	otp_secret?: string | null
	otp_verified?: boolean
	token_salt?: string
}
   
export interface IUserUpdate extends ITokenInsert {
  id: string
	refresh_token?: string
	refresh_token_expires_at?: string | null
	reset_password_token?: string | null
	reset_password_token_expires_at?: string | null
	verify_email_token?: string | null
	verify_email_token_expires_at?: string | null
	email_verified?: boolean
	enable_opt?: boolean
	otp_secret?: string | null
	otp_verified?: boolean
	token_salt?: string
}

export interface IToken extends ITokenInsert {
	refresh_token: string
	refresh_token_expires_at: string | null
	reset_password_token: string | null
	reset_password_token_expires_at: string | null
	verify_email_token: string | null
	verify_email_token_expires_at: string | null
	email_verified: boolean
	enable_opt: boolean
	otp_secret: string | null
	otp_verified: boolean
	token_salt: string
}