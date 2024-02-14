import request from "supertest";
import app from "../../app";
import { Controller as VerificationController } from "../v1/verification/controllers";
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import { IUserInsert } from "./user.test";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;
let tokenController = new TokenController();
let verificationController = new VerificationController();
let userController = new UserController();

export interface ITokenInsert {
	user_id: string
  access_token?: string | null
  access_token_expires_at?: number | null
  refresh_token?: string | null
  refresh_token_expires_at?: number | null
  description?: string | null
}

interface ITokenResponse {
	id: string
	user_id: string
	access_token: string
  access_token_expires_at: number
  refresh_token: string
  refresh_token_expires_at: number
  description: string
}

function isITokenResponse(obj: any): obj is ITokenResponse {
  const keysOfProps: string[] = [
    "id",
		"user_id",
    "access_token",
    "access_token_expires_at",
    "refresh_token",
    "refresh_token_expires_at",
    "description"
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
			access_token: "access_token",
			access_token_expires_at: 1660926192000,
			refresh_token: "refresh_token", 
			refresh_token_expires_at: 1660926192000,
			description: "secret"
    },
    {
			user_id: 'test',
			access_token: "test",
			access_token_expires_at: 1660926192000,
			refresh_token: "test", 
			refresh_token_expires_at: 1660926192000,
			description: "test"
    },
  ]

	let user_id: any
  let result_id: any

  beforeAll( async () => {
    try {
      await verificationController.resetVerification();
      await tokenController.resetToken();
      await userController.resetUser();
    } catch (err) {
      // do nothing
    }
  });

  test("Get Tokens but empty", async () => {
    const res = await request(app).get(`/${api_version}/tokens`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toEqual(0);
  });

  test("Add Token", async () => {
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

  test("Add Token some field to error", async () => {
    const res = await request(app).post(`/${api_version}/token`).send({ token_name: 'some_name' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Add token by unknown user id", async () => {
    let mock_test :ITokenInsert = {
			user_id: 'test',
			access_token: "access_token",
			access_token_expires_at: 1660926192000,
			refresh_token: "refresh_token", 
			refresh_token_expires_at: 1660926192000,
			description: "secret"
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

  test("Get token pagination", async () => {
    const res = await request(app).get(`/${api_version}/pagination/token?page=1&limit=4`);
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

  test("Get tokens pagination but no query", async () => {
    const res = await request(app).get(`/${api_version}/pagination/tokens`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Token: Invalid request');
  });

  test("Get token", async () => {
    const res = await request(app).get(`/${api_version}/token/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isITokenResponse(res.body)).toBe(true);
    expect(res.body.user_id).toBe(test_tokens[0].user_id);

		expect(res.body.access_token).toBe(test_tokens[0].access_token);
		expect(res.body.access_token_expires_at).toBe(test_tokens[0].access_token_expires_at);

		expect(res.body.refresh_token).toBe(test_tokens[0].refresh_token);
    expect(res.body.refresh_token_expires_at).toBe(test_tokens[0].refresh_token_expires_at);
    expect(res.body.description).toBe(test_tokens[0].description);
  });

  test("Update token", async () => {
    const res = await request(app).put(`/${api_version}/token/${result_id}`).send({
      access_token: "new_access_token",
			access_token_expires_at: 1660926199000,
			refresh_token: "new_refresh_token", 
			refresh_token_expires_at: 1660926199000,
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

    expect(res.body.access_token).toBe('new_access_token');
    expect(res.body.access_token_expires_at).toBe(1660926199000);
    expect(res.body.refresh_token).toBe('new_refresh_token');
    expect(res.body.refresh_token_expires_at).toBe(1660926199000);
  });

  test("Update token not found", async () => {
    const res = await request(app).put(`/${api_version}/token/9999999`).send({
      access_token: 'newer_access_token'
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