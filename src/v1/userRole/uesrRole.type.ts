export interface IUserRoleInsert {
	user_id: string
	role_id: string
}
   
export interface IUserRoleUpdate {
 	id: string
	user_id?: string
	role_id?: string
}

export interface IUserRole extends IUserRoleInsert {
	id: string
}