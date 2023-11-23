export interface IGernerateOTP {
    base32: string
    otp_auth_url: string
}

export interface IVerifyOTP {
	user_id: string
	token_otp: string
}

export interface IDisableOTP {
	user_id: string
}

interface IUserVerifyOTP {
	user_id: string
	username: string
	email: string
	enable_otp: boolean
}

export interface IVerifyOTPResp {
	otp_verified: boolean
	user: IUserVerifyOTP
}

export interface IValidateOTPResp {
	otp_valid: boolean
}

export interface IDisableOTPResp {
	otp_disabled: boolean
    user: IUserVerifyOTP
}
