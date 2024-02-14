export interface IVerificationInsert {
	user_id: string
	reset_password_token: string | null
	reset_password_token_expires_at: number | null
	verify_email_token: string | null
	verify_email_token_expires_at: number | null
	email_verified: boolean
	enable_opt: boolean
	otp_secret: string | null
	otp_verified: boolean
	token_salt: string
}
   
export interface IVerificationUpdate {
 	id: string
	reset_password_token?: string | null
	reset_password_token_expires_at?: number | null
	verify_email_token?: string | null
	verify_email_token_expires_at?: number | null
	email_verified?: boolean
	enable_opt?: boolean
	otp_secret?: string | null
	otp_verified?: boolean
	token_salt?: string
}

export interface IVerification extends IVerificationInsert {
	id: string
	// reset_password_token: string | null
	// reset_password_token_expires_at: number | null
	// verify_email_token: string | null
	// verify_email_token_expires_at: number | null
	// email_verified: boolean
	// enable_opt: boolean
	// otp_secret: string | null
	// otp_verified: boolean
	// token_salt: string
}

export interface IVerificationInfo {
	id: string
	username: string
	user_id: string
	reset_password_token: string | null
	reset_password_token_expires_at: number | null
	verify_email_token: string | null
	verify_email_token_expires_at: number | null
	email_verified: boolean
	enable_opt: boolean
	otp_secret: string | null
	otp_verified: boolean
	token_salt: string
}

interface IPaginationInfo {
	total_records: number
	current_page: number
	total_pages: number
	next_page: number | null
	prev_page: number | null
}
  
export interface IPaginationVerificationResp {
	data: IVerificationInfo[]
	pagination: IPaginationInfo
}

