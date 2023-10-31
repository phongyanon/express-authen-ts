import bcrypt from "bcrypt";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.ACCESS_TOKEN_SECRET;

export const hashPassword = (text: string, salt: string) => {
  const hash = bcrypt.hashSync(text, salt);
	return hash;
}

export const comparePassword = (password: string, hash: string) => {
	return bcrypt.compareSync(password, hash);
}

export const genSalt = (saltRounds: number) => {
	return bcrypt.genSaltSync(saltRounds);
}

export const genAccessToken = async (payload: any) => {
	try {
		let token: string = await jwt.sign(payload, accessSecret as Secret, { expiresIn: '1d' }); // HMAC SHA256
		return { success: true, result: token};
	} catch (err) {
		console.log('genAccessToken: ', err);
		return { success: false, result: null };
	}
}

export const genRefreshToken = async (payload: any) => {
	try {
		let token: string = await jwt.sign(payload, refreshSecret as Secret, { expiresIn: '7d' }); // HMAC SHA256
		return { success: true, result: token};
	} catch (err) {
		console.log('genRefreshToken: ', err);
		return { success: false, result: null };
	}
}

const verifyJWT = async (token: string, secret: Secret) => {
	try {
		var decoded = jwt.verify(token, secret);
		return { success: true, result: decoded };
	} catch(err) {
		console.log('verifyJWT: ', err);
		return { success: false, result: null };
	}
}

export const verifyAccessToken = async (token: string) => {
	return verifyJWT(token, accessSecret as Secret);
}

export const verifyRefreshToken = async (token: string) => {
	return verifyJWT(token, refreshSecret as Secret);
}
