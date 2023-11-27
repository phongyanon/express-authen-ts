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

export interface IPaginationUser {
  page: number
  limit: number
}

interface IPaginationInfo {
  total_records: number
  current_page: number
  total_pages: number
  next_page: number | null
  prev_page: number | null
}

export interface IPaginationUserResp {
  data: IUser[]
  pagination: IPaginationInfo
}

export interface IUserProfileInfo {
  user_id: string
  profile_id: string
  username: string
  email: string
  is_sso_user: boolean
  sso_user_id: string | null
  sso_from: string | null
  status: string
  first_name_EN: string
  last_name_EN: string
  first_name_TH: string | null
  last_name_TH: string | null
  gender: string
  date_of_birth: number
  address_EN: string | null
  address_TH: string | null
  zip_code: number
  phone: string
  image_profile: string | null
}

export interface ISearchUser {
  name: string
  limit: number
}