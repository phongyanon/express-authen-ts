import dotenv from 'dotenv';
import { Query as UserMysqlQuery } from '../user/services/mysql';
import { Query as UserMongoQuery } from '../user/services/mongo';
import { IUserInsert } from '../user/user.type';
import { 
	IUserSignUp, 
	IUserSignIn, 
	ISignInResponse, 
	ISignOutResponse, 
	IAccessTokenPayload,
	IRefreshTokenPayload,
	ITokenMethodResponse 
} from './authen.type';
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { 
  hashPassword, 
  genSalt, 
  comparePassword, 
  genAccessToken, 
  genRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken 
} from "../utils/helper";
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Body } from "tsoa";

dotenv.config();

@Route("v1")
export class Controller {
	userQuery: any
  constructor(){
		let UserQuery;
		switch(process.env.DB_TYPE){
				case('mysql'):
					UserQuery = new UserMysqlQuery();
					break;
				case('mongo'):
					UserQuery = new UserMongoQuery();
					break;
		}
		
		this.userQuery = UserQuery;
	}

	@Post("signup")
  @SuccessResponse("200", "Success")
	@Example<ISuccessResponse>({
		"message": "Successfully signup",
		"id": "123"
  })
	signUp(@Body() ctx: IUserSignUp): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let check_user = await this.userQuery.getUserByUsername(ctx.username);
			let check_email = await this.userQuery.getUserByEmail(ctx.email);

			if (check_user.hasOwnProperty('message') && check_email.hasOwnProperty('message')){

				if ((check_user.message === 'User: item does not exist') && (check_email.message === 'User: item does not exist')){
					let salt: string = genSalt(10);
					let newUser: IUserInsert = {
						username: ctx.username,
						password: hashPassword(ctx.password, salt),
						email: ctx.email,
						password_salt: salt
					}

					let result = await this.userQuery.addUser(newUser);
					resolve(result);
				}

			} else if (check_user.hasOwnProperty('error')) {
				resolve(check_user);
			} else if (check_email.hasOwnProperty('error')) {
				resolve(check_email);
			}

			resolve({error: 'Duplicated username or email', message: 'Authen: Invalid request'});
			
		});
	}

	@Post("signin")
  @SuccessResponse("200", "Success")
	@Example<ISignInResponse>({
		"access_token": "your_access_token",
		"refresh_token": "your_refresh_token"
  })
	signIn(@Body() ctx: IUserSignIn): Promise<IResponse | ISignInResponse>{
		return new Promise( async resolve => {
			let check_user = await this.userQuery.getUserByUsername(ctx.username);
			
			if (check_user.hasOwnProperty('message')){

				if (check_user.message === 'User: item does not exist'){
					resolve({error: 'Invalid username or password', message: 'Authen: Invalid request'});
				} else {
					resolve(check_user);
				}

			} else if (check_user.hasOwnProperty('error')) {
				resolve(check_user);
			} else {
				let hash: string = check_user.password;
				let isPasswordMatch: boolean = comparePassword(ctx.password, hash);
				if (isPasswordMatch === true) {
					 
					let access_payload: IAccessTokenPayload = { uid: check_user.id, username: check_user.username }
					let refresh_payload: IRefreshTokenPayload = { uid: check_user.id, username: check_user.username }

					let result_access: ITokenMethodResponse = await genAccessToken(access_payload);
					let result_refresh: ITokenMethodResponse = await genRefreshToken(refresh_payload);

					if ( (result_access.success === true) && (result_refresh.success === true) ){
						resolve({access_token: result_access.result, refresh_token: result_refresh.result})
					} else {
						resolve({error: true, message: 'Authen: Invalid request'});
					}
				} else {
					resolve({error: 'Invalid username or password', message: 'Authen: Invalid request'});
				}
			}
			
		});
	}

}