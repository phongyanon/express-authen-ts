import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Controller as RoleController } from '../role/controllers';
import { Controller as VerificationController } from '../verification/controllers';
import { Role, isSingleRole } from "../utils/role";
import dotenv from 'dotenv';

dotenv.config();
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const noAuth = process.env.NO_AUTH === undefined ? 0: parseInt(process.env.NO_AUTH);
const roleController = new RoleController();
const verificationController = new VerificationController();

export interface CustomRequest extends Request {
 token: string | JwtPayload;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
 	try {
		if (noAuth) next();
		else {

			const token = req.header('Authorization')?.replace('Bearer ', '');	
			if (!token) {
				throw new Error();
			}	
	
			const decoded = jwt.verify(token, accessSecret as Secret);
			(req as CustomRequest).body.token = decoded;
			req.body.rawToken = token;
	
			next();

		}
 	} catch (err) {
  	res.status(401).send({message: 'Please authenticate'});
 	}
};

export const checkRole = (roles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
	if (noAuth) next();
	else {
		try {
		
			let { uid, username } = req.body.token;
  
			let roles_result = await roleController.getRolesByUserId(uid);
			if (roles_result.hasOwnProperty('error')) res.status(500).send(roles_result);
			else {
				req.body.token.roles = roles_result;
				(roles_result as string[]).some(obj => roles.includes(obj)) 
					? next()
					: res.status(401).send({message: "Unauthirize to access this route"});
			}

		} catch (err) {
			res.status(401).send({message: "Unauthirize to access this route"});
		}
	}
};

export const checkRoleUserAccess = async (req: Request, res: Response, next: NextFunction) => {
	if (noAuth) next();
	else {
		const roles: string[] = req.body.token.roles;
		if (isSingleRole(roles, Role.User)) {
			try {
			  const user_id: string = (req.params.user_id).toString();
				const uid: string = (req.body.token.uid).toString();

				if (user_id !== uid) res.status(401).send({message: "Access deny"});
				else next();
			} catch (err) {
				console.log(err);
				res.status(401).send({message: "Access deny"});
			}
			
		} else next();
	}
}