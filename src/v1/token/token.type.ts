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