import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { IRoleInsert, IRoleUpdate, IRole } from './role.type';
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

	@Get("roles")
	@SuccessResponse("200", "Get roles")
	@Example<IRole[]>([{
		id: '5',
		name: 'User'
  }])
	getRoles(): Promise<IResponse | IRole[]>{
		return new Promise( async resolve => {
			let result = await this.query.getRoles();
			resolve(result);
		});
	}

	@Get("role/{id}")
	@SuccessResponse("200", "Get role")
	@Example<IRole>({
		id: '5',
		name: 'User'
  })
	getRole(@Path() id: string): Promise<IResponse | IRole>{
		return new Promise( async resolve => {
			let result = await this.query.getRole(id);
			resolve(result);
		});
	}

	getRolesByUserId(user_id: string): Promise<IResponse | string[]>{
		return new Promise( async resolve => {
			let result = await this.query.getRolesByUserId(user_id);
			resolve(result);
		});
	}

	@Post("role")
  @SuccessResponse("201", "Created")
	@Example<ISuccessResponse>({
		"message": "Successfully create",
		"id": "123"
  })
	addRole(@Body() ctx: IRoleInsert): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.addRole(ctx);
			resolve(result);
		});
	}

	@Put("role/{id}")
  @SuccessResponse("200", "Updated")
	@Example<ISuccessResponse>({
		"message": "Successfully update",
		"id": "123"
  })
	updateRole(@Body() ctx: IRoleUpdate): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.updateRole(ctx);
			resolve(result);
		});
	}

	@Delete("role/{id}")
  @SuccessResponse("200", "Deleted")
	@Example<ISuccessResponse>({
		"message": "Successfully delete",
		"id": "123"
  })
	deleteRole(@Path() id: string): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.deleteRole(id);
			resolve(result);
		});
	}

	resetRole(){
		return new Promise( async resolve => {
			let result = await this.query.resetRole();
			resolve(result);
		});
	}

}