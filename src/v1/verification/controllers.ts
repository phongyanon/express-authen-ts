import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { IVerificationInsert, IVerificationUpdate, IVerification } from './verification.type';
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