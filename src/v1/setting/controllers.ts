import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { ISettingInsert, ISettingUpdate, ISetting } from './setting.type';
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Body } from "tsoa";

dotenv.config();

@Route("v1")
export class Controller {
	query: any
  constructor(){
		let Query;
		switch(process.env.DB_TYPE){
				case('mysql'):
					Query = new MysqlQuery();
					break;
				case('mongo'):
					Query = new MongoQuery();
					break;
		}
		
		this.query = Query;
	}

	@Get("settings")
	@SuccessResponse("200", "Get settings")
	@Example<ISetting[]>([{
		"id": "3",
    "reset_password_interval": 90,
    "enable_reset_password_interval": false,
    "enable_verify_email": false,
  }])
	getSettings(): Promise<IResponse | ISetting[]>{
		return new Promise( async resolve => {
			let result = await this.query.getSettings();
			resolve(result);
		});
	}

	@Get("setting/{id}")
	@SuccessResponse("200", "Get setting")
	@Example<ISetting>({
		"id": "3",
    "reset_password_interval": 90,
    "enable_reset_password_interval": true,
    "enable_verify_email": false,
  })
	getSetting(@Path() id: string): Promise<IResponse | ISetting>{
		return new Promise( async resolve => {
			let result = await this.query.getSetting(id);
			resolve(result);
		});
	}

	@Post("setting")
  @SuccessResponse("201", "Created")
	@Example<ISuccessResponse>({
		"message": "Successfully create",
		"id": "123"
  })
	addSetting(@Body() ctx: ISettingInsert): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.addSetting(ctx);
			resolve(result);
		});
	}

	@Put("setting/{id}")
  @SuccessResponse("200", "Updated")
	@Example<ISuccessResponse>({
		"message": "Successfully update",
		"id": "123"
  })
	updateSetting(@Body() ctx: ISettingUpdate): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.updateSetting(ctx);
			resolve(result);
		});
	}

	@Delete("setting/{id}")
  @SuccessResponse("200", "Deleted")
	@Example<ISuccessResponse>({
		"message": "Successfully delete",
		"id": "123"
  })
	deleteSetting(@Path() id: string): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.deleteSetting(id);
			resolve(result);
		});
	}

	resetSetting(){
		return new Promise( async resolve => {
			let result = await this.query.resetSetting();
			resolve(result);
		});
	}

}