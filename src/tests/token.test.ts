import request from "supertest";
import app from "../../app";
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import { IUserInsert } from "./user.test";
import dotenv from 'dotenv';
import { before } from "node:test";

dotenv.config();
const api_version = process.env.API_VERSION;
let tokenController = new TokenController();
let userController = new UserController();

export interface ITokenInsert {
	user_id: string
	refresh_token?: string
	refresh_token_expires_at?: number | null
	reset_password_token?: string | null
	reset_password_token_expires_at?: number | null
	verify_email_token?: string | null
	verify_email_token_expires_at?: number | null
	email_verified?: boolean
	enable_opt?: boolean
	otp_secret?: string | null
	otp_verified?: boolean
	token_salt?: string
}

interface ITokenResponse {
	id: string
	user_id: string
	refresh_token: string
	refresh_token_expires_at: number
	reset_password_token: string
	reset_password_token_expires_at: number
	verify_email_token: string
	verify_email_token_expires_at: number
	email_verified: boolean
	enable_opt: boolean
	otp_secret: string
	otp_verified: boolean
	token_salt: string
}

function isITokenResponse(obj: any): obj is ITokenResponse {
  const keysOfProps: string[] = [
    "id",
		"user_id",
		"refresh_token",
		"refresh_token_expires_at",
		"reset_password_token",
		"reset_password_token_expires_at",
		"verify_email_token",
		"verify_email_token_expires_at",
		"email_verified",
		"enable_opt",
		"otp_secret",
		"otp_verified",
		"token_salt",
  ] 
  let result: boolean = true;
  keysOfProps.forEach( (key: string) => {
    result = result && (key in obj)
  })
  return result
}

describe("CRUD Token", () => {

	let test_user: IUserInsert = {
    username: 'token@email.com',
    password: 'test1234',
    password_salt: 'test',
    email: 'john@email.com',
    is_sso_user: false,
    sso_user_id: null,
    sso_from: null, 
    status: 'active'
  };

  let test_tokens: ITokenInsert[] = [
    {
			user_id: 'test',
      refresh_token: "refresh_token",
			refresh_token_expires_at: 1660926192000,
			reset_password_token: "reset_password_token",
			reset_password_token_expires_at: 1660926192000,
			verify_email_token: "email_token", 
			verify_email_token_expires_at: 1660926192000,
			email_verified: false, 
			enable_opt: false,
			otp_secret: "secret",
			otp_verified: false,
			token_salt: "salt",
    },
    {
			user_id: 'test',
      refresh_token: "test",
			refresh_token_expires_at: 1660926192000,
			reset_password_token: "test",
			reset_password_token_expires_at: 1660926192000,
			verify_email_token: "test", 
			verify_email_token_expires_at: 1660926192000,
			email_verified: true, 
			enable_opt: true,
			otp_secret: "test",
			otp_verified: true,
			token_salt: "test",
    },
  ]

	let user_id: any
  let result_id: any

  beforeAll( async () => {
    try {
      await tokenController.resetToken();
      await userController.resetUser();
    } catch (err) {
      // do nothing
    }
  });

  test("Get tokens but empty", async () => {
    const res = await request(app).get(`/${api_version}/tokens`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toEqual(0);
  });

  test("Add token", async () => {
    const res_user = await request(app).post(`/${api_version}/user`).send(test_user);
		user_id = res_user.body.id;
    test_tokens[0].user_id = res_user.body.id.toString();
		test_tokens[1].user_id = res_user.body.id.toString();

		const res = await request(app).post(`/${api_version}/token`).send(test_tokens[0]);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
    
    result_id = res.body.id;
  });

  test("Add token some field to error", async () => {
    const res = await request(app).post(`/${api_version}/token`).send({ token_name: 'some_name' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Add token by unknown user id", async () => {
    let mock_test :ITokenInsert = {
			user_id: 'test',
      refresh_token: "refresh_token",
			refresh_token_expires_at: 1660926192826,
			reset_password_token: "reset_password_token",
			reset_password_token_expires_at: 1660926192826,
			verify_email_token: "email_token", 
			verify_email_token_expires_at: 1660926192826,
			email_verified: false, 
			enable_opt: false,
			otp_secret: "secret",
			otp_verified: false,
			token_salt: "salt",
    }
    const res = await request(app).post(`/${api_version}/token`).send(mock_test);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Get tokens", async () => {
    const res = await request(app).get(`/${api_version}/tokens`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(1);

    res.body.forEach((element: ITokenResponse) => {
      expect(isITokenResponse(element)).toBe(true);
    });
  });

  test("Get token", async () => {
    const res = await request(app).get(`/${api_version}/token/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isITokenResponse(res.body)).toBe(true);
    expect(res.body.user_id).toBe(test_tokens[0].user_id);

		expect(res.body.refresh_token).toBe(test_tokens[0].refresh_token);
		expect(res.body.refresh_token_expires_at).toBe(test_tokens[0].refresh_token_expires_at);
		expect(res.body.reset_password_token).toBe(test_tokens[0].reset_password_token);
		expect(res.body.reset_password_token_expires_at).toBe(test_tokens[0].reset_password_token_expires_at);

		expect(res.body.verify_email_token).toBe(test_tokens[0].verify_email_token);
    expect(res.body.verify_email_token_expires_at).toBe(test_tokens[0].verify_email_token_expires_at);
    expect(res.body.email_verified).toBe(test_tokens[0].email_verified);
    expect(res.body.enable_opt).toBe(test_tokens[0].enable_opt);

		expect(res.body.otp_secret).toBe(test_tokens[0].otp_secret);
		expect(res.body.otp_verified).toBe(test_tokens[0].otp_verified);
		expect(res.body.token_salt).toBe(test_tokens[0].token_salt);
  });

  test("Update token", async () => {
    const res = await request(app).put(`/${api_version}/token/${result_id}`).send({
      email_verified: true,
			enable_opt: true,
			otp_secret: "update_secret",
			otp_verified: true,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully update');
  });

  test("Get updated token", async () => {
    const res = await request(app).get(`/${api_version}/token/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isITokenResponse(res.body)).toBe(true);
		expect(res.body.user_id).toBe(test_tokens[0].user_id);

    expect(res.body.email_verified).toBe(true);
    expect(res.body.enable_opt).toBe(true);
    expect(res.body.otp_secret).toBe('update_secret');
    expect(res.body.otp_verified).toBe(true);
  });

  test("Update token not found", async () => {
    const res = await request(app).put(`/${api_version}/token/9999999`).send({
      otp_secret: 'joen@update_secret.com'
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Token: update item failed');
  });

  test("Add token again", async () => {
    const res = await request(app).post(`/${api_version}/token`).send(test_tokens[1]);

		expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
  });

  test("Get tokens again", async () => {
    const res = await request(app).get(`/${api_version}/tokens`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(2);

    res.body.forEach((element: ITokenResponse) => {
      expect(isITokenResponse(element)).toBe(true);
    });
  });

  test("Delete token", async () => {
    const res = await request(app).delete(`/${api_version}/token/${result_id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully delete');
  });

  test("Get deleted token", async () => {
    const res = await request(app).get(`/${api_version}/token/${result_id}`);
    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Token: item does not exist');
  });

  // afterAll(() => {
  // });
});