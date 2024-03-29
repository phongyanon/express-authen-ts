import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { ITokenInsert, ITokenUpdate, IToken, IPaginationTokenResp } from './token.type';
import { IResponse, ISuccessResponse, IPagination } from "../utils/common.type";
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

	@Get("tokens")
	@SuccessResponse("200", "Get tokens")
	@Example<IToken[]>([{
		id: '5',
		user_id: 'test',
		access_token: "access_token",
		access_token_expires_at: 1660926192000,
		refresh_token: "refresh_token", 
		refresh_token_expires_at: 1660926192000,
		description: "secret"
  }])
	getTokens(): Promise<IResponse | IToken[]>{
		return new Promise( async resolve => {
			let result = await this.query.getTokens();
			resolve(result);
		});
	}

	@Get("token/{id}")
	@SuccessResponse("200", "Get token")
	@Example<IToken>({
		id: '5',
		user_id: 'test',
		access_token: "access_token",
		access_token_expires_at: 1660926192000,
		refresh_token: "refresh_token", 
		refresh_token_expires_at: 1660926192000,
		description: "secret"
  })
	getToken(@Path() id: string): Promise<IResponse | IToken>{
		return new Promise( async resolve => {
			let result = await this.query.getToken(id);
			resolve(result);
		});
	}

	@Get("/user/tokens/{user_id}")
	@SuccessResponse("200", "Get tokens")
	@Example<IToken[]>([{
		id: '5',
		user_id: 'test',
		access_token: "access_token",
		access_token_expires_at: 1660926192000,
		refresh_token: "refresh_token", 
		refresh_token_expires_at: 1660926192000,
		description: "secret"
  }])
	getTokenByUserId(@Path() user_id: string): Promise<IResponse | IToken>{
		return new Promise( async resolve => {
			let result = await this.query.getTokenByUserId(user_id);
			resolve(result);
		});
	}

	@Get("/pagination/tokens")
	@SuccessResponse("200", "Get tokens pagination")
	@Example<IPaginationTokenResp>({
		"data": [
			{
				id: '5',
				username: 'test',
				user_id: 'test',
				access_token: "access_token",
				access_token_expires_at: 1660926192000,
				refresh_token: "refresh_token", 
				refresh_token_expires_at: 1660926192000,
				description: "secret"
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
	getTokenPagination(@Queries() query: IPagination): Promise<IResponse | IPaginationTokenResp>{
		return new Promise( async resolve => {
			if ((query.limit === 0) || (query.page === 0)) resolve({error: true, message: 'Token: Invalid request'});
			else {
				let result = await this.query.getTokenPagination(query.limit, (query.page - 1) * query.limit );

				if (result.hasOwnProperty('error')) resolve(result);
				else {

					let { recordCount } = await this.query.getTokenCount();
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

	@Post("token")
  @SuccessResponse("201", "Created")
	@Example<ISuccessResponse>({
		"message": "Successfully create",
		"id": "123"
  })
	addToken(@Body() ctx: ITokenInsert): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.addToken(ctx);
			resolve(result);
		});
	}

	@Put("token/{id}")
  @SuccessResponse("200", "Updated")
	@Example<ISuccessResponse>({
		"message": "Successfully update",
		"id": "123"
  })
	updateToken(@Body() ctx: ITokenUpdate): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.updateToken(ctx);
			resolve(result);
		});
	}

	@Delete("token/{id}")
  @SuccessResponse("200", "Deleted")
	@Example<ISuccessResponse>({
		"message": "Successfully delete",
		"id": "123"
  })
	deleteToken(@Path() id: string): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.deleteToken(id);
			resolve(result);
		});
	}

	resetToken(){
		return new Promise( async resolve => {
			let result = await this.query.resetToken();
			resolve(result);
		});
	}

}