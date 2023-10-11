export interface IUserSignIn {
  username: string
  password: string
  email: string
}

export interface IUserInsert {
	username: string
  password: string
  email: string
  password_salt?: string | null
  is_sso_user?: boolean
  sso_user_id?: string | null
  sso_from?: string | null
  status?: string
}
 
export interface IUserUpdate {
  id: string
	username?: string
  password?: string
  email?: string
  password_salt?: string
  is_sso_user?: boolean
  sso_user_id?: string | null
  sso_from?: string | null
  status?: string
}

export interface IUser {
  id: string
  username: string
  password: string
  email: string
  password_salt: string
  is_sso_user: boolean
  sso_user_id: string | null
  sso_from: string | null
  status: string
}