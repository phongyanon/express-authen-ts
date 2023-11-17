import dotenv from 'dotenv';
import { Query as UserMysqlQuery } from '../user/services/mysql';
import { Query as UserMongoQuery } from '../user/services/mongo';
import { Query as TokenMysqlQuery } from '../token/services/mysql';
import { Query as TokenMongoQuery } from '../token/services/mongo';
import { Query as RoleMysqlQuery } from '../role/services/mysql';
import { Query as RoleMongoQuery } from '../role/services/mongo';
import { Query as UserRoleMysqlQuery } from '../userRole/services/mysql';
import { Query as UserRoleMongoQuery } from '../userRole/services/mongo';
import { Query as VerificationMysqlQuery } from '../verification/services/mysql';
import { Query as VerificationMongoQuery } from '../verification/services/mongo';
import { IUserInsert, IUserUpdate } from '../user/user.type';
import { 
	IUserSignUp, 
	IUserSignIn, 
	ISignInResponse, 
	ISignOutResponse, 
	IAccessTokenPayload,
	IRefreshTokenPayload,
	ITokenMethodResponse,
	IStatusToken,
	IAuthRefreshToken,
	IAuthRefreshTokenResp,
	IAuthAccessTokenResp,
	IVerifyToken,
	IUserChangePassword,
	IStatusChangePassword,
	IResetPasswordByEmail,
	INewPassword,
	IQueryVerifyEmail
} from './authen.type';
import { IResponse, ISuccessResponse, ISendMailResp } from "../utils/common.type";
import { IToken } from '../token/token.type';
import { Request as Req, query } from "express";
import { 
  hashPassword, 
  genSalt, 
  comparePassword, 
  genAccessToken, 
  genRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken,
	addMinutes,
	genResetPasswordToken
} from "../utils/helper";
import { sendMail } from '../utils/email';
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Body, Request, Queries } from "tsoa";

dotenv.config();
const access_token_age: number = 60*24; // 1 day
const refresh_token_age: number = 60*24*7; // 7 days
const reset_password_token_age: number = 15; // 15 minutes
const verify_email_token_age: number = 60*24; // 1 day

@Route("v1")
export class Controller {
	userQuery: any
	tokenQuery: any
	roleQuery: any
	userRoleQuery: any
	verificationQuery: any
  constructor(){
		let UserQuery;
		let TokenQuery;
		let RoleQuery;
		let UserRoleQuery;
		let verificationQuery;
		switch(process.env.DB_TYPE){
				case('mysql'):
					UserQuery = new UserMysqlQuery();
					TokenQuery = new TokenMysqlQuery();
					RoleQuery = new RoleMysqlQuery();
					UserRoleQuery = new UserRoleMysqlQuery();
					verificationQuery = new VerificationMysqlQuery();
					break;
				case('mongo'):
					UserQuery = new UserMongoQuery();
					TokenQuery = new TokenMongoQuery();
					RoleQuery = new RoleMongoQuery();
					UserRoleQuery = new UserRoleMongoQuery();
					verificationQuery = new VerificationMongoQuery();
					break;
		}
		
		this.userQuery = UserQuery;
		this.tokenQuery = TokenQuery;
		this.roleQuery = RoleQuery;
		this.userRoleQuery = UserRoleQuery;
		this.verificationQuery = verificationQuery;
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
					if (result.hasOwnProperty('error')) resolve(result);
					else {
						let role_user = await this.roleQuery.getRoleByName('User');
						if (role_user.hasOwnProperty('error')) resolve(role_user);

						let assign_role = await this.userRoleQuery.addUserRole({user_id: result.id, role_id: role_user.id});
						if (assign_role.hasOwnProperty('error')) resolve(assign_role);

						const current = Date.now();
						let user_verify = await this.verificationQuery.addVerification({
							user_id: result.id,
							reset_password_token: null,
							reset_password_token_expires_at: current,
							verify_email_token: null,
							verify_email_token_expires_at: current,
							email_verified: false,
							enable_opt: false,
							otp_secret: null,
							otp_verified: false,
							token_salt: ''
						})
						if (user_verify.hasOwnProperty('error')) resolve(user_verify);

						resolve({message: 'Successfully signup', id: result.id});
					}
					
				} else resolve({error: 'Duplicated username or email', message: 'Authen: Invalid request'});

			} else if (check_user.hasOwnProperty('message')) {

				if (check_user.message === 'User: item does not exist') {
					resolve({error: 'Duplicated username or email', message: 'Authen: Invalid request'});
				} else resolve(check_user);

			} else if (check_email.hasOwnProperty('message')) {

				if (check_email.message === 'User: item does not exist') {
					resolve({error: 'Duplicated username or email', message: 'Authen: Invalid request'});
				} else resolve(check_email);

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
							refresh_token: hashPassword(result_refresh.result as string, salt), 
							refresh_token_expires_at: addMinutes(date, refresh_token_age), 
						
							access_token: hashPassword(result_access.result as string, salt),
							access_token_expires_at: addMinutes(date, access_token_age), 
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
			// client (frontend) should delete tokens in localstorage or cookies.
			let rawToken: string = req.body.rawToken;
			let user_tokens = await this.tokenQuery.getTokenByUserId(req.body.token.uid);
			if (user_tokens.hasOwnProperty('error')) resolve(user_tokens);
			else {
				user_tokens.forEach( async (obj: IToken) => {
					if (comparePassword(rawToken, obj.access_token as string)) {
						let del_token = await this.tokenQuery.deleteToken(obj.id);
						if (del_token.message === 'Successfully delete'){
							resolve({message: 'signout'});
						}

						resolve(del_token);
					}
				});
			}
		});
	}

	@Post("/password/change")
	@SuccessResponse("200", "Change password")
	@Example<IStatusChangePassword>({
		message: 'success'
  })
	changePassword(@Body() ctx: IUserChangePassword): Promise<IResponse | IStatusChangePassword>{
		return new Promise( async resolve => {
			let user = await this.userQuery.getUser(ctx.user_id);
			if (user.hasOwnProperty('error')) {
				resolve(user);

			} else {
				let hash: string = user.password;
				let isPasswordMatch: boolean = comparePassword(ctx.password, hash);
				
				if (isPasswordMatch === true) {
					let salt: string = genSalt(10);
					let updated_data: IUserUpdate = {
						id: ctx.user_id,
						password: hashPassword(ctx.new_password, salt),
						password_salt: salt
					}

					let del_token = await this.tokenQuery.deleteTokenByUserId(ctx.user_id);

					if (del_token.hasOwnProperty('error')) resolve(del_token);
					else {
						let result = await this.userQuery.updatePasswordUser(updated_data);
						if (result.hasOwnProperty('error')) resolve(result);
						else resolve({message: 'success'});
					}
					
				} else {
					resolve({error: 'Invalid password', message: 'Authen: Invalid request'})
				}
			}
		});
	}

	@Post("/password/reset/generate")
	@SuccessResponse("200", "Generate reset password token by email")
	@Example<IStatusChangePassword>({
		message: 'success'
  })
	genResetPasswordToken(@Body() ctx: IResetPasswordByEmail): Promise<IResponse | IStatusChangePassword>{
		return new Promise( async resolve => {
			let user_email = await this.userQuery.getUserByEmail(ctx.email);
			if (user_email.hasOwnProperty('error')) {

				if (user_email.hasOwnProperty('message')){
					if (user_email.message ===  'User: item does not exist'){
						resolve({error: 'Email does not exist', message: 'Authen: Invalid request'})
					} else resolve(user_email);
				} else resolve(user_email);

			}
			else {
				
				let user_verification = await this.verificationQuery.getVerificationByUserId(user_email.id);

				if (user_verification.hasOwnProperty('error')) resolve(user_verification);
				else {
					let reset_token: string = genResetPasswordToken(64); // token length 64
					let salt: string = genSalt(10);
					let date = new Date();

					let gen_reset_token = await this.verificationQuery.updateVerification({
						id: user_verification.id,
						reset_password_token: hashPassword(reset_token, salt),
						reset_password_token_expires_at: addMinutes(date, reset_password_token_age)
					})

					if (gen_reset_token.hasOwnProperty('error')) resolve(gen_reset_token);
					else {
						
						if (process.env.NODE_ENV === 'test') {
							resolve({message: 'success'});
						} else {
							// send reset_password_link to email
							let reset_password_link: string = `127.0.0.1:8000/v1/reset/password/?user_id=${user_email.id}&token=${reset_token}`;
							let send_mail_result: ISendMailResp = await sendMail({
								email_to: user_email.email,
								subject: `Reset password from my auth platform to ${user_email.email}`,
								text: `
									<h1>Reset password</h1>
									<p>Your reset password link: ${reset_password_link}</p><br/>
									<button type="submit" formmethod="get">
										<a href="${reset_password_link}">Click here to reset password</a>
									</button>
									`
							});
							
							if (send_mail_result.hasOwnProperty('error')) resolve(send_mail_result);
							else resolve({message: 'success'});
						}
					}

				}
			}
		});
	}

	@Put("/reset/password/{user_id}/{token}")
	@SuccessResponse("200", "Reset password from email")
	@Example<IStatusChangePassword>({
		message: 'success'
  })
	resetPasswordByResetPasswordToken(
		@Path() user_id: string, @Path() token: string, @Body() ctx: INewPassword
	): Promise<IResponse | IStatusChangePassword>{
		return new Promise( async resolve => {
			let user_result = await this.userQuery.getUser(user_id);
			if (user_result.hasOwnProperty('error')) {

				if (user_result.hasOwnProperty('message')){
					if (user_result.message ===  'User: item does not exist'){
						resolve({error: 'Invalid token or user', message: 'Authen: Invalid request'})
					} else resolve(user_result);
				} else resolve(user_result);

			}
			else {

				let user_verification = await this.verificationQuery.getVerificationByUserId(user_result.id);

				if (user_verification.hasOwnProperty('error')) resolve(user_verification);
				else {
					if (user_verification.reset_password_token === null) {
						resolve({error: 'Invalid token or user', message: 'Authen: Invalid request'});
					} else {
						let isTokenMatch: boolean = comparePassword(token, user_verification.reset_password_token);
						let now = new Date();
	
						if ((now.valueOf() < user_verification.reset_password_token_expires_at * 1000) && (isTokenMatch === true)) {
							
							let salt: string = genSalt(10);
							let updated_data: IUserUpdate = {
								id: user_result.id,
								password: hashPassword(ctx.new_password, salt),
								password_salt: salt
							}
	
							await this.tokenQuery.deleteTokenByUserId(user_result.id);
							let result = await this.userQuery.updatePasswordUser(updated_data);
							if (result.hasOwnProperty('error')) resolve(result);
							else resolve({message: 'success'});
	
						} else {
							resolve({error: 'Invalid token or user', message: 'Authen: Invalid request'})
						}
					}
				}
			}


		});
	}

	
	@Post("/email/token/generate")
	@SuccessResponse("200", "Generate verify email token")
	@Example<IStatusChangePassword>({
		message: 'success'
  })
	genVerifyEmailToken(@Body() ctx: IResetPasswordByEmail): Promise<IResponse | IStatusChangePassword>{
		return new Promise( async resolve => {
			let user_email = await this.userQuery.getUserByEmail(ctx.email);
			if (user_email.hasOwnProperty('error')) {

				if (user_email.hasOwnProperty('message')){
					if (user_email.message ===  'User: item does not exist'){
						resolve({error: 'Email does not exist', message: 'Authen: Invalid request'})
					} else resolve(user_email);
				} else resolve(user_email);

			}
			else {
				
				let user_verification = await this.verificationQuery.getVerificationByUserId(user_email.id);

				if (user_verification.hasOwnProperty('error')) resolve(user_verification);
				else {
					let verify_token: string = genResetPasswordToken(64); // token length 64
					let salt: string = genSalt(10);
					let date = new Date();

					let gen_verify_token = await this.verificationQuery.updateVerification({
						id: user_verification.id,
						verify_email_token: hashPassword(verify_token, salt),
						verify_email_token_expires_at: addMinutes(date, verify_email_token_age)
					})

					if (gen_verify_token.hasOwnProperty('error')) resolve(gen_verify_token);
					else {
						
						if (process.env.NODE_ENV === 'test') {
							resolve({message: 'success'});
						} else {
							// send link button to verify email
							let verify_email_link: string = `127.0.0.1:8000/v1/email/token/verify/?user_id=${user_email.id}&token=${verify_token}`;
							let send_mail_result: ISendMailResp = await sendMail({
								email_to: user_email.email,
								subject: `Verify Email from my auth platform to ${user_email.email}`,
								text: `
									<h1>Verify Email</h1>
									<div>Click button below to verify your email.</div>
									<div>link: ${verify_email_link}</div>
									<form action="${verify_email_link}" method="post" target="_blank">
										<button type="submit" formmethod="post">Verify Email</button>
									</form>
									`
							});
							
							if (send_mail_result.hasOwnProperty('error')) resolve(send_mail_result);
							else resolve({message: 'success'});
						}
					}

				}
			}
		});
	}

	@Post("/email/token/verify")
	@SuccessResponse("200", "Verify email")
	@Example<IStatusChangePassword>({
		message: 'success'
  })
	verifyEmail(@Queries() query: IQueryVerifyEmail): Promise<IResponse | IStatusChangePassword>{
		return new Promise( async resolve => {
			let user_result = await this.userQuery.getUser(query.user_id);
			if (user_result.hasOwnProperty('error')) {

				if (user_result.hasOwnProperty('message')){
					if (user_result.message ===  'User: item does not exist'){
						resolve({error: 'Invalid token or user', message: 'Authen: Invalid request'})
					} else resolve(user_result);
				} else resolve(user_result);

			}
			else {

				let user_verification = await this.verificationQuery.getVerificationByUserId(user_result.id);

				if (user_verification.hasOwnProperty('error')) resolve(user_verification);
				else {
					if (user_verification.verify_email_token === null){
						resolve({error: 'Invalid token or user', message: 'Authen: Invalid request'})
					} else {
						let isTokenMatch: boolean = comparePassword(query.token, user_verification.verify_email_token);
						let now = new Date();
		
						if ((now.valueOf() < user_verification.verify_email_token_expires_at * 1000) && (isTokenMatch === true)) {
	
							let result = await this.verificationQuery.updateVerification({
								id: user_verification.id,
								email_verified: true
							});
	
							if (result.hasOwnProperty('error')) resolve(result);
							else resolve({message: 'success'});
	
						} else {
							resolve({error: 'Invalid token or user', message: 'Authen: Invalid request'});
						}
					}
				}

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
			if (user_tokens.hasOwnProperty('error')) {
				resolve(user_tokens);
			}
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

	@Post("/auth/refresh/token")
  @SuccessResponse("200", "Success")
	@Example<IAuthAccessTokenResp>({
		"access_token": "new_access_token",
  })
	authRefreshToken(@Body() body: IAuthRefreshToken): Promise<IResponse | IAuthAccessTokenResp>{
		return new Promise( async resolve => {
    	let verify_refresh: IVerifyToken = await verifyRefreshToken(body.refresh_token as string);
			if (verify_refresh.success === true){
				let refresh_payload: IRefreshTokenPayload = verify_refresh.result as IRefreshTokenPayload

				let user_token = await this.tokenQuery.getTokenByUserIdAndRefreshToken(refresh_payload.uid, body.refresh_token);
				if (user_token.hasOwnProperty('error')) resolve({error: true, message: 'Authen: Invalid request'})

				let access_payload: IAccessTokenPayload = { uid: refresh_payload.uid, username: refresh_payload.username }
				let result_access: ITokenMethodResponse = await genAccessToken(access_payload);

				if (result_access.success === true) {
					resolve({access_token: result_access.result as string})
				}

				resolve({error: true, message: 'Authen: Invalid request'}) // delete this

			} else {
				resolve({error: true, message: 'Authen: Invalid request'})
			}
		});
	}

	@Post("/auth/refresh/tokens")
  @SuccessResponse("200", "Success")
	@Example<ISignInResponse>({
		"access_token": "new_access_token",
		"refresh_token": "new_refresh_token",
  })
	authBothTokens(@Body() body: IAuthRefreshToken): Promise<IResponse | ISignInResponse>{
		return new Promise( async resolve => {
    	let verify_refresh: IVerifyToken = await verifyRefreshToken(body.refresh_token as string);
			if (verify_refresh.success === true){
				let refresh_payload: IRefreshTokenPayload = verify_refresh.result as IRefreshTokenPayload

				let result_refresh: ITokenMethodResponse = await genRefreshToken({
					uid: refresh_payload.uid, username: refresh_payload.username
				});
				let result_access: ITokenMethodResponse = await genAccessToken({
					uid: refresh_payload.uid, username: refresh_payload.username
				});

				if ((result_access.success === true) && (result_refresh.success === true)) {
					// get Token by user_id and refresh_token
					let user_token = await this.tokenQuery.getTokenByUserIdAndRefreshToken(refresh_payload.uid, body.refresh_token);
					if (user_token.hasOwnProperty('error')) resolve({error: true, message: 'Authen: Invalid request'})
					
					let date = new Date();
					let salt: string = genSalt(5);

					let updated_token = await this.tokenQuery.updateToken({
						id: user_token.id,
						refresh_token: hashPassword(result_refresh.result as string, salt), 
						refresh_token_expires_at: addMinutes(date, refresh_token_age),

						access_token: hashPassword(result_access.result as string, salt), 
						access_token_expires_at: addMinutes(date, access_token_age), 
					})

					if (updated_token.hasOwnProperty('error')) resolve({error: true, message: 'Authen: Invalid request'})

					resolve({
						access_token: result_access.result,
						refresh_token: result_refresh.result
					})
				}

				resolve({error: true, message: 'Authen: Invalid request'})

			} else {
				resolve({error: true, message: 'Authen: Invalid request'})
			}
		});
	}

	@Post("/revoke/token/{user_id}")
  @SuccessResponse("200", "Success")
	@Example<ISuccessResponse>({
		"message": "success"
  })
	revokeToken(@Path() user_id: string): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			let del_token = await this.tokenQuery.deleteTokenByUserId(user_id);
			if (del_token.hasOwnProperty('message')){
				if (del_token.message === 'Successfully delete'){
					resolve({message: 'success'})
				}
				else {
					resolve(del_token);
				}
			} else {
				resolve(del_token);
			}
		});
	}

}