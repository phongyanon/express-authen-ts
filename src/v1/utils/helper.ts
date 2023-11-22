import bcrypt from "bcrypt";
import Randomstring from 'randomstring';
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { IAccessTokenPayload, IRefreshTokenPayload } from "./common.type";
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

export const genAccessToken = async (payload: IAccessTokenPayload) => {
	try {
		let token: string = await jwt.sign(payload, accessSecret as Secret, { expiresIn: '1d' }); // HMAC SHA256
		return { success: true, result: token };
	} catch (err) {
		console.log('genAccessToken: ', err);
		return { success: false, result: null };
	}
}

export const genRefreshToken = async (payload: IRefreshTokenPayload) => {
	try {
		let token: string = await jwt.sign(payload, refreshSecret as Secret, { expiresIn: '7d' }); // HMAC SHA256
		return { success: true, result: token };
	} catch (err) {
		console.log('genRefreshToken: ', err);
		return { success: false, result: null };
	}
}

const verifyJWT = async (token: string, secret: Secret) => {
	try {
		let decoded = jwt.verify(token, secret);
		return { success: true, result: decoded as JwtPayload };
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

export const addMinutes = (date: Date, minutes: number) => {
	date.setMinutes(date.getMinutes() + minutes);
	return Math.floor(date.valueOf() / 1000)
}

export const genResetPasswordToken = (len: number) => {
	let gen_token = Randomstring.generate({
		length: len,
		charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!_-'
	})
	return gen_token;
}

export const genStringToken = (len: number) => {
	let gen_token = Randomstring.generate({
		length: len,
		charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!_-+*@#$%&'
	})
	return gen_token;
}