import { Request  as Req } from "express";
import * as OTPAuth from "otpauth";
import { encode } from "hi-base32";
import { genStringToken } from "../utils/helper";
import { IGernerateOTP } from "./2factorAuthen.type";
import { IResponse } from "../utils/common.type";
import { IVerification } from "../verification/verification.type";
import { Controller as UserController } from "../user/controllers";
import { Controller as VerificationController } from "../verification/controllers";
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Request } from "tsoa";

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
	@SuccessResponse("200", "Created")
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
				console.log(error);
				resolve({error: true, message: `OPT: error while generate opt`})
			}
	
		});
	};

}



