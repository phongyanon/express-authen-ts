import { Request  as Req } from "express";
import * as OTPAuth from "otpauth";
import { encode } from "hi-base32";
import { genStringToken } from "../utils/helper";
import { IGernerateOTP, IVerifyOTP, IVerifyOTPResp, IDisableOTP, IValidateOTPResp, IDisableOTPResp } from "./2factorAuthen.type";
import { IResponse } from "../utils/common.type";
import { IVerification } from "../verification/verification.type";
import { Controller as UserController } from "../user/controllers";
import { Controller as VerificationController } from "../verification/controllers";
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Request, Body } from "tsoa";

@Route("v1")
export class Controller {
	userController: any
	verificationController: any
  constructor(){
		let UserController_obj;
		let VerificationController_obj;

		UserController_obj = new UserController();
		VerificationController_obj = new VerificationController();
				
		
		this.userController = UserController_obj;
		this.verificationController = VerificationController_obj;
	}

	@Post("/otp/generate")
	@SuccessResponse("200", "Created otp")
	@Example<IGernerateOTP>({
			"base32": "base32_secret",
			"otp_auth_url": "https://www.testtesttes.test"
	})
	generateOTP(@Request() req: Req): Promise<IResponse | IGernerateOTP> {
		return new Promise( async resolve => {
	
			try {
				const { user_id } = req.body;
				const user = await this.userController.getUser(user_id);
				const user_verify = await this.verificationController.getVerificationByUserId(user_id);
	
				if (user.hasOwnProperty('error')) resolve(user as IResponse);
				else if (user_verify.hasOwnProperty('error')) resolve(user_verify as IResponse);
				else {
					const base32_secret = encode(genStringToken(32));
		
					let totp = new OTPAuth.TOTP({
						issuer: "MyAuthenBoss.com",
						label: "MyAuthenBoss",
						algorithm: "SHA1",
						digits: 6,
						secret: base32_secret,
					});
			
					let otpauth_url = totp.toString();
	
					let update_verify = await this.verificationController.updateVerification({
						id: (user_verify as IVerification).id,
						otp_secret: base32_secret
					})
	
					if (update_verify.hasOwnProperty('error')) resolve(update_verify);
					else {
						resolve({
							base32: base32_secret,
							otp_auth_url: otpauth_url
						});
					}
				}
				
			} catch (error) {
				resolve({error: true, message: `OTP: error while generate opt`})
			}
	
		});
	};

	@Post("/otp/verify")
	@SuccessResponse("200", "Verify otp")
	@Example<IVerifyOTPResp>({
		"otp_verified": true,
		"user": {
			"user_id": "user_id",
			"username": "John",
			"email": "John@email.com",
			"enable_otp": true
		}
	})
	verifyOTP(@Body() ctx: IVerifyOTP): Promise<IResponse | IVerifyOTPResp> {
		return new Promise( async resolve => {
	
			try {
				const { user_id, token_otp } = ctx;
				const user = await this.userController.getUser(user_id);
				const user_verify = await this.verificationController.getVerificationByUserId(user_id);
	
				if (user.hasOwnProperty('error')) resolve({error: true, message: "OTP: Token is invalid or user does not exist"});
				else if (user_verify.hasOwnProperty('error')) resolve({error: true, message: "OTP: Token is invalid or user does not exist"});
				else {

					let totp = new OTPAuth.TOTP({
						issuer: "MyAuthenBoss.com",
						label: "MyAuthenBoss",
						algorithm: "SHA1",
						digits: 6,
						secret: user_verify.otp_secret!,
					});
			
					let delta = totp.validate({ token: token_otp });
			
					if (delta === null) {
						resolve({error: true, message: "OTP: Token is invalid or user does not exist"});
					} else {

						let update_verify = await this.verificationController.updateVerification({
							id: (user_verify as IVerification).id,
							enable_opt: true,
							otp_verified: true 
						})
		
						if (update_verify.hasOwnProperty('error')) resolve(update_verify);
						else {
							resolve({
								otp_verified: true,
								user: {
									user_id: user.id,
									username: user.username,
									email: user.email,
									enable_otp: true
								}
							});
						}
					}
				}
				
			} catch (error) {
				resolve({error: true, message: `OTP: error while verify opt`})
			}
	
		});
	};

	@Post("/otp/validate")
	@SuccessResponse("200", "Validate otp")
	@Example<IValidateOTPResp>({
		"otp_valid": true
	})
	validateOTP(@Body() ctx: IVerifyOTP): Promise<IResponse | IValidateOTPResp> {
		return new Promise( async resolve => {
	
			try {
				const { user_id, token_otp } = ctx;
				const user = await this.userController.getUser(user_id);
				const user_verify = await this.verificationController.getVerificationByUserId(user_id);
	
				if (user.hasOwnProperty('error')) resolve({error: true, message: "OTP: Token is invalid or user does not exist"});
				else if (user_verify.hasOwnProperty('error')) resolve({error: true, message: "OTP: Token is invalid or user does not exist"});
				else {

					let totp = new OTPAuth.TOTP({
						issuer: "MyAuthenBoss.com",
						label: "MyAuthenBoss",
						algorithm: "SHA1",
						digits: 6,
						secret: user_verify.otp_secret!,
					});
			
					let delta = totp.validate({ token: token_otp });
			
					if (delta === null) {
						resolve({error: true, message: "OTP: Token is invalid or user does not exist"});
					} else {
						resolve({otp_valid: true});
					}
				}
				
			} catch (error) {
				resolve({error: true, message: `OTP: error while validate opt`})
			}
	
		});
	};

	@Post("/otp/disable")
	@SuccessResponse("200", "Disable otp")
	@Example<IDisableOTPResp>({
		"otp_disabled": true,
		"user": {
			"user_id": "user_id",
			"username": "John",
			"email": "John@email.com",
			"enable_otp": true
		}
	})
	disableOTP(@Body() ctx: IDisableOTP): Promise<IResponse | IDisableOTPResp> {
		return new Promise( async resolve => {
	
			try {
				const { user_id } = ctx;
				const user = await this.userController.getUser(user_id);
				const user_verify = await this.verificationController.getVerificationByUserId(user_id);
	
				if (user.hasOwnProperty('error')) resolve({error: true, message: "OTP: User does not exist"});
				else if (user_verify.hasOwnProperty('error')) resolve({error: true, message: "OTP: User does not exist"});
				else {

					let update_verify = await this.verificationController.updateVerification({
						id: (user_verify as IVerification).id,
						enable_opt: false
					})
	
					if (update_verify.hasOwnProperty('error')) resolve(update_verify);
					else {
						resolve({
							otp_disabled: true,
							user: {
								user_id: user.id,
								username: user.username,
								email: user.email,
								enable_otp: false
							}
						});
					}
				}
				
			} catch (error) {
				resolve({error: true, message: `OTP: error while disable opt`})
			}
	
		});
	};

}



