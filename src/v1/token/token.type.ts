export interface ITokenInsert {
	user_id: string
	access_token: string | null
  access_token_expires_at: number | null
  refresh_token: string | null
  refresh_token_expires_at: number | null
  description: string | null
}
   
export interface ITokenUpdate {
 	id: string
	access_token?: string | null
	access_token_expires_at?: number | null
	refresh_token?: string | null
	refresh_token_expires_at?: number | null
	description?: string | null
}

export interface IToken extends ITokenInsert {
	id: string
}

export interface ITokenInfo {
	id: string
	username: string
	user_id: string
	access_token?: string | null
	access_token_expires_at?: number | null
	refresh_token?: string | null
	refresh_token_expires_at?: number | null
	description?: string | null
	create_at?: number | null
}

interface IPaginationInfo {
	total_records: number
	current_page: number
	total_pages: number
	next_page: number | null
	prev_page: number | null
}
  
export interface IPaginationTokenResp {
	data: ITokenInfo[]
	pagination: IPaginationInfo
}