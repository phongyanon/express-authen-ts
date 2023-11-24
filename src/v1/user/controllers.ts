import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { IUserInsert, IUserUpdate, IUser, IPaginationUser, IPaginationUserResp } from './user.type';
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Body, Queries } from "tsoa";

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

	@Get("users")
	@SuccessResponse("200", "Get users")
	@Example<IUser[]>([{
		"id": "3",
    "username": "test2",
    "password": "test1234",
    "password_salt": "test",
    "email": "john2@email.com",
    "is_sso_user": false,
    "sso_user_id": null,
    "sso_from": null,
    "status": "active",
  }])
	getUsers(): Promise<IResponse | IUser[]>{
		return new Promise( async resolve => {
			let result = await this.query.getUsers();
			resolve(result);
		});
	}

	@Get("user/{id}")
	@SuccessResponse("200", "Get user")
	@Example<IUser>({
		"id": "3",
    "username": "test2",
    "password": "test1234",
    "password_salt": "test",
    "email": "john2@email.com",
    "is_sso_user": false,
    "sso_user_id": null,
    "sso_from": null,
    "status": "active",
  })
	getUser(@Path() id: string): Promise<IResponse | IUser>{
		return new Promise( async resolve => {
			let result = await this.query.getUser(id);
			resolve(result);
		});
	}

	@Get("/pagination/users")
	@SuccessResponse("200", "Get users pagination")
	@Example<IPaginationUserResp>({
		"data": [
			{
				"id": "3",
				"username": "test2",
				"password": "test1234",
				"password_salt": "test",
				"email": "john2@email.com",
				"is_sso_user": false,
				"sso_user_id": null,
				"sso_from": null,
				"status": "active"
			}
		],
		"pagination": {
			"total_records": 8,
			"current_page": 1,
			"total_pages": 3,
			"next_page": 2,
			"prev_page": null
		}
  })
	getUserPagination(@Queries() query: IPaginationUser): Promise<IResponse | IPaginationUserResp>{
		return new Promise( async resolve => {
			if ((query.limit === 0) || (query.page === 0)) resolve({error: true, message: 'User: Invalid request'});
			else {
				let result = await this.query.getUserPagination(query.limit, (query.page - 1) * query.limit );

				if (result.hasOwnProperty('error')) resolve(result);
				else {

					let { userCount } = await this.query.getUserCount();
					let totalPage: number  = Math.ceil(userCount / query.limit); // round up
					let nextPage: number | null = null;
					let prevPage: number | null = null;

					if (query.page + 1 <= totalPage) nextPage = query.page + 1;
					if (query.page - 1 >= 1) prevPage = query.page - 1;

					resolve({
						data: result,
						pagination: {
							total_records: userCount,
							current_page: query.page,
							total_pages: totalPage,
							next_page: nextPage,
							prev_page: prevPage
						}
					});

				}
			}
		});
	}

	@Post("user")
  @SuccessResponse("201", "Created")
	@Example<ISuccessResponse>({
		"message": "Successfully create",
		"id": "123"
  })
	addUser(@Body() ctx: IUserInsert): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let check_user = await this.query.getUserByUsername(ctx.username);
			if (check_user.hasOwnProperty('message')){

				if (check_user.message === 'User: item does not exist'){
					let result = await this.query.addUser(ctx);
					resolve(result);
				}

			} else if (check_user.hasOwnProperty('error')) {
				resolve(check_user);
			} else {
				resolve({error: 'Duplicated username', message: 'User: Invalid request'});
			}
			
		});
	}

	@Put("user/{id}")
  @SuccessResponse("200", "Updated")
	@Example<ISuccessResponse>({
		"message": "Successfully update",
		"id": "123"
  })
	updateUser(@Body() ctx: IUserUpdate): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.updateUser(ctx);
			resolve(result);
		});
	}

	@Delete("user/{id}")
  @SuccessResponse("200", "Deleted")
	@Example<ISuccessResponse>({
		"message": "Successfully delete",
		"id": "123"
  })
	deleteUser(@Path() id: string): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.deleteUser(id);
			resolve(result);
		});
	}

	resetUser(){
		return new Promise( async resolve => {
			let result = await this.query.resetUser();
			resolve(result);
		});
	}

}