import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { IProfileInsert, IProfileUpdate, IProfile, IProfileUpdateByUser } from './profile.type';
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

	@Get("profiles")
	@SuccessResponse("200", "Get Profiles")
	@Example<IProfile[]>([{
		id: '5',
		user_id: 'test',
		first_name_EN: 'John',
		last_name_EN: 'Doe',
		first_name_TH: 'จอน',
		last_name_TH: 'โด',
		gender: 'male',
		date_of_birth: 1699516723,
		address_EN: 'test address',
		address_TH: 'ทดสอบ',
		zip_code: 27000,
		phone: '+66939999999',
		image_profile: 'test_url'
  }])
	getProfiles(): Promise<IResponse | IProfile[]>{
		return new Promise( async resolve => {
			let result = await this.query.getProfiles();
			resolve(result);
		});
	}

	@Get("profile/{id}")
	@SuccessResponse("200", "Get Profile")
	@Example<IProfile>({
		id: '5',
		user_id: 'test',
		first_name_EN: 'John',
		last_name_EN: 'Doe',
		first_name_TH: 'จอน',
		last_name_TH: 'โด',
		gender: 'male',
		date_of_birth: 1699516723,
		address_EN: 'test address',
		address_TH: 'ทดสอบ',
		zip_code: 27000,
		phone: '+66939999999',
		image_profile: 'test_url'
  })
	getProfile(@Path() id: string): Promise<IResponse | IProfile>{
		return new Promise( async resolve => {
			let result = await this.query.getProfile(id);
			resolve(result);
		});
	}

	@Get("user/profile/{user_id}")
	@SuccessResponse("200", "Get Profile by user_id")
	@Example<IProfile>({
		id: '5',
		user_id: 'test',
		first_name_EN: 'John',
		last_name_EN: 'Doe',
		first_name_TH: 'จอน',
		last_name_TH: 'โด',
		gender: 'male',
		date_of_birth: 1699516723,
		address_EN: 'test address',
		address_TH: 'ทดสอบ',
		zip_code: 27000,
		phone: '+66939999999',
		image_profile: 'test_url'
  })
	getProfileByUserId(@Path() user_id: string): Promise<IResponse | IProfile>{
		return new Promise( async resolve => {
			let result = await this.query.getProfileByUserId(user_id);
			resolve(result);
		});
	}
	

	@Post("profile")
  @SuccessResponse("201", "Created")
	@Example<ISuccessResponse>({
		"message": "Successfully create",
		"id": "123"
  })
	addProfile(@Body() ctx: IProfileInsert): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.addProfile(ctx);
			resolve(result);
		});
	}

	@Post("/user/profile/{user_id}")
  @SuccessResponse("201", "Created")
	@Example<ISuccessResponse>({
		"message": "Successfully create",
		"id": "123"
  })
	addProfileByUserId(@Body() ctx: IProfileInsert): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.addProfile(ctx);
			resolve(result);
		});
	}

	@Put("profile/{id}")
  @SuccessResponse("200", "Updated")
	@Example<ISuccessResponse>({
		"message": "Successfully update",
		"id": "123"
  })
	updateProfile(@Body() ctx: IProfileUpdate): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.updateProfile(ctx);
			resolve(result);
		});
	}

	@Put("user/profile/{user_id}")
  @SuccessResponse("200", "Updated")
	@Example<ISuccessResponse>({
		"message": "Successfully update",
		"id": "123"
  })
	updateProfileByUserId(@Body() ctx: IProfileUpdateByUser): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let user_profile = await this.query.getProfileByUserId(ctx.user_id);

			if (user_profile.hasOwnProperty('error')) resolve(user_profile);
			else {
				let update_data: IProfileUpdate = { id: user_profile.id , ...ctx};
				let result = await this.query.updateProfile(update_data);
				resolve(result);
			}
		});
	}

	@Delete("profile/{id}")
  @SuccessResponse("200", "Deleted")
	@Example<ISuccessResponse>({
		"message": "Successfully delete",
		"id": "123"
  })
	deleteProfile(@Path() id: string): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.deleteProfile(id);
			resolve(result);
		});
	}

	resetProfile(){
		return new Promise( async resolve => {
			let result = await this.query.resetProfile();
			resolve(result);
		});
	}

}