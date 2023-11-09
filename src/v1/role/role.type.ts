export interface IRoleInsert {
	name: string
}
   
export interface IRoleUpdate {
	id: string
	name: string
}

export interface IRole extends IRoleInsert {
	id: string
}