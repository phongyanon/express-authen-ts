import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { IVerificationInsert, IVerificationUpdate, IVerification, IPaginationVerificationResp } from './verification.type';
import { IResponse, ISuccessResponse, IPagination} from "../utils/common.type";
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

	@Get("verifications")
	@SuccessResponse("200", "Get tsers")
	@Example<IVerification[]>([{
		id: '5',
		user_id: 'test',
		reset_password_token: "reset_password_token",
		reset_password_token_expires_at: 1660926192826,
		verify_email_token: "email_token", 
		verify_email_token_expires_at: 1660926192826,
		email_verified: false, 
		enable_opt: false,
		otp_secret: "secret",
		otp_verified: false,
		token_salt: "salt",
  }])
	getVerifications(): Promise<IResponse | IVerification[]>{
		return new Promise( async resolve => {
			let result = await this.query.getVerifications();
			resolve(result);
		});
	}

	@Get("verification/{id}")
	@SuccessResponse("200", "Get verification")
	@Example<IVerification>({
		id: '5',
		user_id: 'test',
		reset_password_token: "reset_password_token",
		reset_password_token_expires_at: 1660926192826,
		verify_email_token: "email_token", 
		verify_email_token_expires_at: 1660926192826,
		email_verified: false, 
		enable_opt: false,
		otp_secret: "secret",
		otp_verified: false,
		token_salt: "salt",
  })
	getVerification(@Path() id: string): Promise<IResponse | IVerification>{
		return new Promise( async resolve => {
			let result = await this.query.getVerification(id);
			resolve(result);
		});
	}

	@Get("user/verification/{user_id}")
	@SuccessResponse("200", "Get verification by user_id")
	@Example<IVerification>({
		id: '5',
		user_id: 'test',
		reset_password_token: "reset_password_token",
		reset_password_token_expires_at: 1660926192826,
		verify_email_token: "email_token", 
		verify_email_token_expires_at: 1660926192826,
		email_verified: false, 
		enable_opt: false,
		otp_secret: "secret",
		otp_verified: false,
		token_salt: "salt",
  })
	getVerificationByUserId(@Path() user_id: string): Promise<IResponse | IVerification>{
		return new Promise( async resolve => {
			let result = await this.query.getVerificationByUserId(user_id);
			resolve(result);
		});
	}

	@Get("/pagination/verifications")
	@SuccessResponse("200", "Get verifications pagination")
	@Example<IPaginationVerificationResp>({
		"data": [
			{
				id: '5',
				user_id: 'test',
				username: 'test12',
				reset_password_token: "reset_password_token",
				reset_password_token_expires_at: 1660926192826,
				verify_email_token: "email_token", 
				verify_email_token_expires_at: 1660926192826,
				email_verified: false, 
				enable_opt: false,
				otp_secret: "secret",
				otp_verified: false,
				token_salt: "salt",
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
	getVerificationPagination(@Queries() query: IPagination): Promise<IResponse | IPaginationVerificationResp>{
		return new Promise( async resolve => {
			if ((query.limit === 0) || (query.page === 0)) resolve({error: true, message: 'Verification: Invalid request'});
			else {
				let result = await this.query.getVerificationPagination(query.limit, (query.page - 1) * query.limit );

				if (result.hasOwnProperty('error')) resolve(result);
				else {

					let { recordCount } = await this.query.getVerificationCount();
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

	@Post("verification")
  @SuccessResponse("201", "Created")
	@Example<ISuccessResponse>({
		"message": "Successfully create",
		"id": "123"
  })
	addVerification(@Body() ctx: IVerificationInsert): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.addVerification(ctx);
			resolve(result);
		});
	}

	@Put("verification/{id}")
  @SuccessResponse("200", "Updated")
	@Example<ISuccessResponse>({
		"message": "Successfully update",
		"id": "123"
  })
	updateVerification(@Body() ctx: IVerificationUpdate): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.updateVerification(ctx);
			resolve(result);
		});
	}

	@Delete("verification/{id}")
  @SuccessResponse("200", "Deleted")
	@Example<ISuccessResponse>({
		"message": "Successfully delete",
		"id": "123"
  })
	deleteVerification(@Path() id: string): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let result = await this.query.deleteVerification(id);
			resolve(result);
		});
	}

	resetVerification(){
		return new Promise( async resolve => {
			let result = await this.query.resetVerification();
			resolve(result);
		});
	}

}