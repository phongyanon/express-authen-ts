export interface IProfileInsert {
	user_id: string,
	first_name_EN: string,
	last_name_EN: string,
	first_name_TH: string | null,
	last_name_TH: string | null,
	gender: string,
	date_of_birth: number,
	address_EN: string,
	address_TH: string | null,
	zip_code: number,
	phone: string,
	image_profile: string | null
}
   
export interface IProfileUpdate {
	id: string
	user_id?: string,
	first_name_EN?: string,
	last_name_EN?: string,
	first_name_TH?: string | null,
	last_name_TH?: string | null,
	gender?: string,
	date_of_birth?: number,
	address_EN?: string,
	address_TH?: string | null,
	zip_code?: number,
	phone?: string,
	image_profile?: string | null
}

export interface IProfileUpdateByUser {
	user_id: string,
	first_name_EN?: string,
	last_name_EN?: string,
	first_name_TH?: string | null,
	last_name_TH?: string | null,
	gender?: string,
	date_of_birth?: number,
	address_EN?: string,
	address_TH?: string | null,
	zip_code?: number,
	phone?: string,
	image_profile?: string | null
}

export interface IProfile extends IProfileInsert {
	id: string
}