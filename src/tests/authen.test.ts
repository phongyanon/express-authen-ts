import request from "supertest";
import app from "../../app";
import dotenv from 'dotenv';
import { JwtPayload } from "jsonwebtoken";
import { Controller as VerificationController } from "../v1/verification/controllers";
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import { 
  hashPassword, 
  genSalt, 
  comparePassword, 
  genAccessToken, 
  genRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken 
} from "../v1/utils/helper";

let tokenController = new TokenController();
let verificationController = new VerificationController();
let userController = new UserController();

dotenv.config();
const api_version = process.env.API_VERSION;

interface IUserSignUp {
  username: string
  password: string
  email: string
}

interface IUserSignIn {
  username: string
  password: string
  email?: string
}

interface ITokenPayload {
  uid: string
  username: string
}

interface IGenerateToken {
  success: boolean
  result: string | null
}

interface IVerifyToken {
  success: boolean
  result: JwtPayload | null
}


describe("Authen method", () => {
  test("Hash password and check is match", async () => {
    let plainText: string = 'hello1234';
    let salt: string = genSalt(5);
    let hash: string = hashPassword(plainText, salt);
    let result: boolean = comparePassword(plainText, hash);

    let result_invalid: boolean = comparePassword('hello4567', hash);
    expect(result).toBe(true);
    expect(result_invalid).toBe(false);
  });

  test("Sign jwt", async () => {
    let payload: ITokenPayload = { uid: '123', username: 'pukkhom' }
    let result_access: IGenerateToken = await genAccessToken(payload);
    let result_refresh: IGenerateToken = await genRefreshToken(payload);

    expect(result_access.success).toBe(true);
    expect(result_refresh.success).toBe(true);

    let verify_access: IVerifyToken = await verifyAccessToken(result_access.result as string);
    let verify_refresh: IVerifyToken = await verifyRefreshToken(result_refresh.result as string);

    expect(verify_access.success).toBe(true);
    expect(verify_refresh.success).toBe(true);

  });
});

describe("Authentication", () => {

  let test_users: IUserSignUp[] = [
    {
      username: "kaew",
      password: "test1234",
      email: "kaew@email.com"
    },
    {
      username: "fond",
      password: "test45678",
      email: "fond@email.com"
    }
  ]

  let result_id: any
  let result_signin: any

  beforeAll( async () => {
    try {
      await tokenController.resetToken();
      await verificationController.resetVerification();
      await userController.resetUser();
    } catch (err) {
      // do nothing
    }
  });

	test("Sign up", async () => {
    const res = await request(app).post(`/${api_version}/signup`).send(test_users[0]);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Successfully signup');
  });

	test("Sign up duplicated username", async () => {
    const res = await request(app).post(`/${api_version}/signup`).send({
      username: "kaew",
      password: "test1111",
      email: "kaew2@email.com"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');

    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Duplicated username or email');
  });

  test("Sign up duplicated email", async () => {
    const res = await request(app).post(`/${api_version}/signup`).send({
      username: "kaew2",
      password: "test1234",
      email: "kaew@email.com"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');

    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Duplicated username or email');
  });

	test("Sign in to get token", async () => {
    const res = await request(app).post(`/${api_version}/signin`).send({
      username: test_users[0].username,
      password: test_users[0].password
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('refresh_token');
    expect(res.body).toHaveProperty('access_token');
  });

  test("Sign in with wrong password", async () => {
    const res = await request(app).post(`/${api_version}/signin`).send({
      username: test_users[0].username,
      password: '1234zzzz'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');

    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Invalid username or password');
  });

	test("Get access token status", async () => {
    const res = await request(app).get(`/${api_version}/token/status`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.status).toBe('ok');
  });

  test("Get access token status not found", async () => {
    const res = await request(app).get(`/${api_version}/token/status`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Token: item does not exist');
  });

	test("Sign out", async () => {
    const res = await request(app).post(`/${api_version}/signout`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.status).toBe('signout');
  });

	test("Get access token status after sign out", async () => {
    const res = await request(app).get(`/${api_version}/token/status`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.status).toBe('expired');
  });

});