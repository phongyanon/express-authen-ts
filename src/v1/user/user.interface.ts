export interface IUserSignIn {
  username: string
  password: string
  email: string
}

export interface IUser {
	username?: string
  email?: string
  is_sso_user?: boolean
  sso_user_id?: string | null
  sso_from?: string | null
  status?: string
}
  
export interface IUserResponse {
  id: string
  username: string
  email: string
  is_sso_user: boolean
  sso_user_id: string | null
  sso_from: string | null
  status: string
}