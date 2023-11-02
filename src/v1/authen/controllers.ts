import dotenv from 'dotenv';
import { Query as UserMysqlQuery } from '../user/services/mysql';
import { Query as UserMongoQuery } from '../user/services/mongo';
import { Query as TokenMysqlQuery } from '../token/services/mysql';
import { Query as TokenMongoQuery } from '../token/services/mongo';
import { IUserInsert } from '../user/user.type';
import { 
	IUserSignUp, 
	IUserSignIn, 
	ISignInResponse, 
	ISignOutResponse, 
	IAccessTokenPayload,
	IRefreshTokenPayload,
	ITokenMethodResponse,
	IStatusToken
} from './authen.type';
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { IToken } from '../token/token.type';
import { Request as Req } from "express";
import { 
  hashPassword, 
  genSalt, 
  comparePassword, 
  genAccessToken, 
  genRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken,
	addMinutes
} from "../utils/helper";
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Body, Request } from "tsoa";

dotenv.config();

@Route("v1")
export class Controller {
	userQuery: any
	tokenQuery: any
  constructor(){
		let UserQuery;
		let TokenQuery;
		switch(process.env.DB_TYPE){
				case('mysql'):
					UserQuery = new UserMysqlQuery();
					TokenQuery = new TokenMysqlQuery();
					break;
				case('mongo'):
					UserQuery = new UserMongoQuery();
					TokenQuery = new TokenMongoQuery();
					break;
		}
		
		this.userQuery = UserQuery;
		this.tokenQuery = TokenQuery;
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
						password_salt: salt,
						is_sso_user: false, 
						sso_user_id: null, 
						sso_from: null, 
						status: 'active'
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
						let date: Date = new Date();
						let salt: string = genSalt(5);
						
						let add_token = await this.tokenQuery.addToken({
							user_id: check_user.id,
							refresh_token: hashPassword(result_access.result as string, salt), 
							refresh_token_expires_at: addMinutes(date, 60*24), 
						
							access_token: hashPassword(result_refresh.result as string, salt),
							access_token_expires_at: addMinutes(date, 60*24*7), 
							description: ctx.hasOwnProperty('info') ? ctx.info : ''
						});

						if (add_token.message === "Successfully create") {
							resolve({access_token: result_access.result, refresh_token: result_refresh.result})
						} else {
							resolve(add_token);
						}

					} else {
						resolve({error: true, message: 'Authen: Invalid request'});
					}
				} else {
					resolve({error: 'Invalid username or password', message: 'Authen: Invalid request'});
				}
			}
			
		});
	}

	@Post("signout")
  @SuccessResponse("200", "Success")
	@Example<ISuccessResponse>({
		"message": "signout"
  })
	signOut(@Request() req: Req): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			// delete all token by user_id.
			// client (frontend) should delete tokens in localstorage or cookies.
			let del_token = await this.tokenQuery.deleteTokenByUserId(req.body.token.uid);
			if (del_token.hasOwnProperty('message')){
				if (del_token.message === 'Successfully delete'){
					resolve({message: 'signout'})
				}
				else {
					resolve(del_token);
				}
			} else {
				resolve(del_token);
			}
		});
	}

	@Get("/status/token")
	@SuccessResponse("200", "Get token status")
	@Example<IStatusToken>({
		status: 'ok'
  })
	getTokenStatus(@Request() req: Req ): Promise<IResponse | IStatusToken>{ // token: string, user_id: string
		return new Promise( async resolve => {
			let rawToken: string = req.body.rawToken;
			let user_tokens = await this.tokenQuery.getTokenByUserId(req.body.token.uid);
			if (user_tokens.hasOwnProperty('error')) resolve(user_tokens);
			else {

				user_tokens.forEach( (obj: IToken) =>  {
					if ((comparePassword(rawToken, obj.access_token as string)) || (comparePassword(rawToken, obj.refresh_token as string))){
						resolve({status: 'ok'});
					}
				});
				
				resolve({status: 'expired'});

			}
		});
	}

}