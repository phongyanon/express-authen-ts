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
let verificationController = new VerificationController();
let profileController = new ProfileController();
let userRoleController = new UserRoleController();
let userController = new UserController();

export interface IVerificationInsert {
	user_id: string
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

interface IVerificationResponse {
	id: string
	user_id: string
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

function isIVerificationResponse(obj: any): obj is IVerificationResponse {
  const keysOfProps: string[] = [
    "id",
		"user_id",
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

describe("CRUD Verification", () => {

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

  let test_verifications: IVerificationInsert[] = [
    {
			user_id: 'test',
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
      await verificationController.resetVerification();
      await profileController.resetProfile();
      await userRoleController.resetUserRole();
      await userController.resetUser();
    } catch (err) {
      // do nothing
    }
  });

  test("Get verifications but empty", async () => {
    const res = await request(app).get(`/${api_version}/verifications`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toEqual(0);
  });

  test("Add verification", async () => {
    const res_user = await request(app).post(`/${api_version}/user`).send(test_user);
		user_id = res_user.body.id;
    test_verifications[0].user_id = res_user.body.id.toString();
		test_verifications[1].user_id = res_user.body.id.toString();

		const res = await request(app).post(`/${api_version}/verification`).send(test_verifications[0]);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
    
    result_id = res.body.id;
  });

  test("Add verification some field to error", async () => {
    const res = await request(app).post(`/${api_version}/verification`).send({ verification_name: 'some_name' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Add verification by unknown user id", async () => {
    let mock_test :IVerificationInsert = {
			user_id: 'test',
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
    const res = await request(app).post(`/${api_version}/verification`).send(mock_test);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Get verifications", async () => {
    const res = await request(app).get(`/${api_version}/verifications`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(1);

    res.body.forEach((element: IVerificationResponse) => {
      expect(isIVerificationResponse(element)).toBe(true);
    });
  });

  test("Get verifications pagination", async () => {
    const res = await request(app).get(`/${api_version}/pagination/verifications?page=1&limit=4`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength;

    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total_records');
    expect(res.body.pagination).toHaveProperty('current_page');
    
    expect(res.body.pagination).toHaveProperty('total_pages');
    expect(res.body.pagination).toHaveProperty('next_page');
    expect(res.body.pagination).toHaveProperty('prev_page');

    expect(res.body.pagination.total_records).toBe(1);
    expect(res.body.pagination.current_page).toBe(1);
    expect(res.body.pagination.total_pages).toBe(1);

    expect(res.body.pagination.next_page).toBe(null);
    expect(res.body.pagination.prev_page).toBe(null);
  });

  test("Get verifications pagination but no query", async () => {
    const res = await request(app).get(`/${api_version}/pagination/verifications`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Verification: Invalid request');
  });

  test("Get verification", async () => {
    const res = await request(app).get(`/${api_version}/verification/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIVerificationResponse(res.body)).toBe(true);
    expect(res.body.user_id).toBe(test_verifications[0].user_id);

		expect(res.body.reset_password_token).toBe(test_verifications[0].reset_password_token);
		expect(res.body.reset_password_token_expires_at).toBe(test_verifications[0].reset_password_token_expires_at);

		expect(res.body.verify_email_token).toBe(test_verifications[0].verify_email_token);
    expect(res.body.verify_email_token_expires_at).toBe(test_verifications[0].verify_email_token_expires_at);
    expect(res.body.email_verified).toBe(test_verifications[0].email_verified);
    expect(res.body.enable_opt).toBe(test_verifications[0].enable_opt);

		expect(res.body.otp_secret).toBe(test_verifications[0].otp_secret);
		expect(res.body.otp_verified).toBe(test_verifications[0].otp_verified);
		expect(res.body.token_salt).toBe(test_verifications[0].token_salt);
  });

  test("Update verification", async () => {
    const res = await request(app).put(`/${api_version}/verification/${result_id}`).send({
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

  test("Get updated verification", async () => {
    const res = await request(app).get(`/${api_version}/verification/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIVerificationResponse(res.body)).toBe(true);
		expect(res.body.user_id).toBe(test_verifications[0].user_id);

    expect(res.body.email_verified).toBe(true);
    expect(res.body.enable_opt).toBe(true);
    expect(res.body.otp_secret).toBe('update_secret');
    expect(res.body.otp_verified).toBe(true);
  });

  test("Update verification not found", async () => {
    const res = await request(app).put(`/${api_version}/verification/9999999`).send({
      otp_secret: 'joen@update_secret.com'
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Verification: update item failed');
  });

  test("Add verification again", async () => {
    const res = await request(app).post(`/${api_version}/verification`).send(test_verifications[1]);

		expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
  });

  test("Get verifications again", async () => {
    const res = await request(app).get(`/${api_version}/verifications`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(2);

    res.body.forEach((element: IVerificationResponse) => {
      expect(isIVerificationResponse(element)).toBe(true);
    });
  });

  test("Delete verification", async () => {
    const res = await request(app).delete(`/${api_version}/verification/${result_id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully delete');
  });

  test("Get deleted verification", async () => {
    const res = await request(app).get(`/${api_version}/verification/${result_id}`);
    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Verification: item does not exist');
  });

  // afterAll(() => {
  // });
});