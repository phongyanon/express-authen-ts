import { Router, Request, Response } from "express";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { IGernerateOTP } from "./2factorAuthen.type";
import { auth, checkRole, checkRoleUserAccess, checkRoleUserUpdate } from "../middleware/authen";
import { Role } from "../utils/role";
import { Controller } from "./controllers";

let twoFactorAuthen = new Controller();
const router = Router();

router.post("/otp/generate", async (req: Request, res: Response) => {
	let result: IResponse | IGernerateOTP = await twoFactorAuthen.generateOTP(req);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.post("/otp/verify", async (req: Request, res: Response) => {
	let result: IResponse | ISuccessResponse = {message: 'test'}
	res.status(200).send(result);
});

router.post("/otp/validate", async (req: Request, res: Response) => {
	let result: IResponse | ISuccessResponse = {message: 'test'}
	res.status(200).send(result);
});

router.post("/otp/disable", async (req: Request, res: Response) => {
	let result: IResponse | ISuccessResponse = {message: 'test'}
	res.status(200).send(result);
});

export { router };