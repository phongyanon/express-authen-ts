import request from "supertest";
import app from "../../app";
import { Controller as VerificationController } from "../v1/verification/controllers";
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import { Controller as ProfileController } from "../v1/profile/controllers";
import { Controller as UserRoleController } from "../v1/userRole/controllers";

import { IUserInsert } from "./user.test";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;
let tokenController = new TokenController();
let userRoleController = new UserRoleController();
let profileController = new ProfileController();
let verificationController = new VerificationController();
let userController = new UserController();

describe("TOTP for 2 factors authen", () => {

	let test_user: IUserInsert = {
    username: 'userOTP@email.com',
    password: 'test1234',
    password_salt: 'test',
    email: 'userOTP@email.com',
    is_sso_user: false,
    sso_user_id: null,
    sso_from: null, 
    status: 'active'
  };

	let user_id: string

  beforeAll( async () => {
    try {
			await tokenController.resetToken();
      await verificationController.resetVerification();
      await profileController.resetProfile();
      await userRoleController.resetUserRole();
      await userController.resetUser();
    } catch (err) {
      // do nothing
    }
  });

	test("Sign up", async () => {
    const res = await request(app).post(`/${api_version}/signup`).send(test_user);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully signup');
    
    user_id = res.body.id;
  });


  test("Generate OTP", async () => {
    const res = await request(app).post(`/${api_version}/otp/generate`).send({user_id: user_id});

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('base32');
    expect(res.body).toHaveProperty('otp_auth_url');
  });

	// Correct token test in postman
  test("Verify OTP but wrong token", async () => {
    const res = await request(app).post(`/${api_version}/otp/verify`).send({user_id: user_id, token_otp: "testka"});

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('OTP: Token is invalid or user does not exist');
  });

	test("Verify OTP but wrong input", async () => {
    const res = await request(app).post(`/${api_version}/otp/verify`).send({'test': "testka"});

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test("Validate OTP but wrong token", async () => {
    const res = await request(app).post(`/${api_version}/otp/validate`).send({user_id: user_id, token_otp: "testka"});

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('OTP: Token is invalid or user does not exist');
  });
	
	test("Validate OTP but wrong input", async () => {
    const res = await request(app).post(`/${api_version}/otp/validate`).send({'test': "testka"});

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

	test("Disable OTP but wrong input", async () => {
    const res = await request(app).post(`/${api_version}/otp/disable`).send({test: "test"});

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test("Disable OTP", async () => {
    const res = await request(app).post(`/${api_version}/otp/disable`).send({user_id: user_id});

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('otp_disabled');
    expect(res.body).toHaveProperty('user');
  });
});