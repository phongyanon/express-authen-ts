import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();
const accessSecret = process.env.ACCESS_TOKEN_SECRET;

export interface CustomRequest extends Request {
 token: string | JwtPayload;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
 	try {
  	const token = req.header('Authorization')?.replace('Bearer ', '');	
  	if (!token) {
  	  throw new Error();
  	}	

  	const decoded = jwt.verify(token, accessSecret as Secret);
  	(req as CustomRequest).body.token = decoded;
		req.body.rawToken = token;

  	next();
 	} catch (err) {
  	res.status(401).send({message: 'Please authenticate'});
 	}
};