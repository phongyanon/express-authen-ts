import { Router, Request, Response } from "express";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { IGernerateOTP, IVerifyOTP, IVerifyOTPResp, IDisableOTP, IValidateOTPResp, IDisableOTPResp } from "./2factorAuthen.type";
import { auth, checkRole, checkRoleUserAccess, checkRoleUserUpdate } from "../middleware/authen";
import { Role } from "../utils/role";
import { Controller } from "./controllers";

let twoFactorAuthen = new Controller();
const router = Router();

router.post("/otp/generate", 
		auth, 
		checkRole([Role.SuperAdmin, Role.Admin, Role.User]), 
		checkRoleUserUpdate, 
		async (req: Request, res: Response) => {

	let result: IResponse | IGernerateOTP = await twoFactorAuthen.generateOTP(req);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.post("/otp/verify", 
		auth, 
		checkRole([Role.SuperAdmin, Role.Admin, Role.User]), 
		checkRoleUserUpdate,
		async (req: Request, res: Response) => {

	const body: IVerifyOTP = req.body;
	let result: IResponse | IVerifyOTPResp = await twoFactorAuthen.verifyOTP(body);

  if (result.hasOwnProperty('error')) {
		
		if ((result as IResponse).message === 'OTP: Token is invalid or user does not exist'){
			res.status(401).send(result);
		} else res.status(500).send(result);

	} else res.status(200).send(result);
});

router.post("/otp/validate", 
		auth, 
		checkRole([Role.SuperAdmin, Role.Admin, Role.User]), 
		checkRoleUserUpdate,
		async (req: Request, res: Response) => {

	const body: IVerifyOTP = req.body;
	let result: IResponse | IValidateOTPResp = await twoFactorAuthen.validateOTP(body);

  if (result.hasOwnProperty('error')) {
		
		if ((result as IResponse).message === 'OTP: Token is invalid or user does not exist'){
			res.status(401).send(result);
		} else res.status(500).send(result);

	} else res.status(200).send(result);
});

router.post("/otp/disable", 
		auth, 
		checkRole([Role.SuperAdmin, Role.Admin, Role.User]), 
		checkRoleUserUpdate,
		async (req: Request, res: Response) => {
			
	const body: IDisableOTP = req.body;
	let result: IResponse | IDisableOTPResp = await twoFactorAuthen.disableOTP(body);

  if (result.hasOwnProperty('error')) {
		
		if ((result as IResponse).message === 'OTP: User does not exist'){
			res.status(401).send(result);
		} else res.status(500).send(result);

	} else res.status(200).send(result);
});

export { router };