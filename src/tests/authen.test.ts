import request from "supertest";
import app from "../../app";
import dotenv from 'dotenv';
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as UserController } from "../v1/user/controllers";

let tokenController = new TokenController();
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

describe("Authen method", () => {
  test("Hash password and check is match", async () => {

  });

  test("Sign jwt", async () => {

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

    expect(res.body.message).toBe('User: Invalid request');
    expect(res.body.error).toBe('Duplicated username');
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

    expect(res.body.message).toBe('User: Invalid request');
    expect(res.body.error).toBe('Wrong username or password');
  });

	test("Get access token status", async () => {
    const res = await request(app).get(`/${api_version}/token/status`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.status).toBe('ok');
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