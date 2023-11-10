import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Controller as RoleController } from '../role/controllers';
import dotenv from 'dotenv';

dotenv.config();
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const noAuth = process.env.NO_AUTH === undefined ? 0: parseInt(process.env.NO_AUTH);
const roleController = new RoleController();

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
			// TODO: write test for checkRole
			if (roles_result.hasOwnProperty('error')) res.status(500).send(roles_result);
			else {
				(roles_result as string[]).some(obj => roles.includes(obj)) 
					? next()
					: res.status(401).send({message: "Unauthirize to access this route"});
			}

		} catch (err) {
			res.status(401).send({message: "Unauthirize to access this route"})
		}
	}
};