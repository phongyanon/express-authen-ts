import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { Query as  MysqlRoleQuery } from '../role/services/mysql';
import { 
	IUserInsert, 
	IUserUpdate, 
	IUser, 
	IPaginationUser, 
	IPaginationUserResp, 
	IUserProfileInfo, 
	ISearchUser,
	IPaginationProfileResp,
	IUserWithRoles
} from './user.type';
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Body, Queries } from "tsoa";

dotenv.config();

@Route("v1")
export class Controller {
	query: any
	roleQuery: any
  constructor(){
		let Query;
		let RoleQuery;
		switch(process.env.DB_TYPE){
				case('mysql'):
					Query = new MysqlQuery();
					RoleQuery = new MysqlRoleQuery();
					break;
				case('mongo'):
					Query = new MongoQuery();
					break;
		}
		
		this.query = Query;
		this.roleQuery = RoleQuery;
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
				"status": "active",
				"roles": ['User']
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
					let users_roles: IUserWithRoles[] = await Promise.all(result.map( async (user: any) => {
						let roles_result = await this.roleQuery.getRolesByUserId(user.id);
						user.roles = [];
						if (roles_result) {
							user.roles = roles_result
						}
						return user;
					}))

					let { recordCount } = await this.query.getUserCount();
					let totalPage: number  = Math.ceil(recordCount / query.limit); // round up
					let nextPage: number | null = null;
					let prevPage: number | null = null;

					if (query.page + 1 <= totalPage) nextPage = query.page + 1;
					if (query.page - 1 >= 1) prevPage = query.page - 1;

					resolve({
						data: users_roles,
						pagination: {
							total_records: recordCount,
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

	@Get("/pagination/profiles")
	@SuccessResponse("200", "Get users profiles pagination")
	@Example<IPaginationProfileResp>({
		"data": [
			{
				"user_id": "3",
				"profile_id": "4",
    		"username": "test2",
    		"email": "john2@email.com",
    		"is_sso_user": false,
    		"sso_user_id": null,
    		"sso_from": null,
    		"status": "active",
				"first_name_EN": "test",
				"last_name_EN": "test",
				"first_name_TH": "test",
				"last_name_TH": "test",
				"gender": "male",
				"date_of_birth": 1699516723,
				"address_EN": "test",
				"address_TH": "test",
				"zip_code": 29000,
				"phone": "+66939999999",
				"image_profile": "https://image_profile_url.test"
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
	getUserProfilePagination(@Queries() query: IPaginationUser): Promise<IResponse | IPaginationProfileResp>{
		return new Promise( async resolve => {
			if ((query.limit === 0) || (query.page === 0)) resolve({error: true, message: 'Profile: Invalid request'});
			else {
				let result = await this.query.getUserProfilePagination(query.limit, (query.page - 1) * query.limit );

				if (result.hasOwnProperty('error')) resolve(result);
				else {

					let { recordCount } = await this.query.getProfileCount();
					let totalPage: number  = Math.ceil(recordCount / query.limit); // round up
					let nextPage: number | null = null;
					let prevPage: number | null = null;

					if (query.page + 1 <= totalPage) nextPage = query.page + 1;
					if (query.page - 1 >= 1) prevPage = query.page - 1;

					resolve({
						data: result,
						pagination: {
							total_records: recordCount,
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

	@Get("/user/profile/{id}")
	@SuccessResponse("200", "Get user profile by user_id")
	@Example<IUserProfileInfo>({
		"user_id": "3",
		"profile_id": "4",
    "username": "test2",
    "email": "john2@email.com",
    "is_sso_user": false,
    "sso_user_id": null,
    "sso_from": null,
    "status": "active",
		"first_name_EN": "test",
		"last_name_EN": "test",
		"first_name_TH": "test",
		"last_name_TH": "test",
		"gender": "male",
		"date_of_birth": 1699516723,
		"address_EN": "test",
		"address_TH": "test",
		"zip_code": 29000,
		"phone": "+66939999999",
		"image_profile": "https://image_profile_url.test"
  })
	getUserProfileByUserId(@Path() id: string): Promise<IResponse | IUserProfileInfo>{
		return new Promise( async resolve => {
			let result = await this.query.getUserProfileByUserId(id);
			resolve(result);
		});
	}

	@Get("/users/search")
	@SuccessResponse("200", "Search user")
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
	searchUser(@Queries() query: ISearchUser): Promise<IResponse | IUser[]>{
		return new Promise( async resolve => {
			if ((query.name === '')||(query.limit === 0)) resolve({error: true, message: 'User: Invalid request'});
			else {
				let result = await this.query.searchUser(query.name, query.limit);
				resolve(result);
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