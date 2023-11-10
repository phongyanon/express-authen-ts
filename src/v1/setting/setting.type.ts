export interface ISettingInsert {
	reset_password_interval: number,
    enable_reset_password_interval: boolean,
    enable_verify_email: boolean,
}
   
export interface ISettingUpdate {
    id: string,
	reset_password_interval?: number,
    enable_reset_password_interval?: boolean,
    enable_verify_email?: boolean,
}

export interface ISetting extends ISettingInsert {
	id: string
}