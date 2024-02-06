import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { IUserRoleInsert, IUserRoleUpdate, IUserRole } from './uesrRole.type';
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

	@Get("userRoles")
	@SuccessResponse("200", "Get userRoles")
	@Example<IUserRole[]>([{
		id: '5',
		user_id: 'test',
		role_id: 'test'
  }])
	getUserRoles(): Promise<IResponse | IUserRole[]>{
		return new Promise( async resolve => {
			let result = await this.query.getUserRoles();
			resolve(result);
		});
	}

	@Get("userRole/{id}")
	@SuccessResponse("200", "Get userRole")
	@Example<IUserRole>({
		id: '5',
		user_id: 'test',
		role_id: 'test'
  })
	getUserRole(@Path() id: string): Promise<IResponse | IUserRole>{
		return new Promise( async resolve => {
			let result = await this.query.getUserRole(id);
			resolve(result);
		});
	}

	@Get("userRole/user/{user_id}")
	@SuccessResponse("200", "Get userRole by user_id")
	@Example<IUserRole[]>([{
		id: '5',
		user_id: 'test',
		role_id: 'test'
  }])
	getUserRoleByUserId(@Path() user_id: string): Promise<IResponse | IUserRole[]>{
		return new Promise( async resolve => {
			let result = await this.query.getUserRoleByUserId(user_id);
			resolve(result);
		});
	}

	@Post("userRole")
  @SuccessResponse("201", "Created")
	@Example<ISuccessResponse>({
		"message": "Successfully create",
		"id": "123"
  })
	addUserRole(@Body() ctx: IUserRoleInsert): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.addUserRole(ctx);
			resolve(result);
		});
	}

	@Put("userRole/{id}")
  @SuccessResponse("200", "Updated")
	@Example<ISuccessResponse>({
		"message": "Successfully update",
		"id": "123"
  })
	updateUserRole(@Body() ctx: IUserRoleUpdate): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.updateUserRole(ctx);
			resolve(result);
		});
	}

	@Delete("userRole/{id}")
  @SuccessResponse("200", "Deleted")
	@Example<ISuccessResponse>({
		"message": "Successfully delete",
		"id": "123"
  })
	deleteUserRole(@Path() id: string): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.deleteUserRole(id);
			resolve(result);
		});
	}

	resetUserRole(){
		return new Promise( async resolve => {
			let result = await this.query.resetUserRole();
			resolve(result);
		});
	}

}