import request from "supertest";
import app from "../../app";
import { Controller as UserController } from "../v1/user/controllers";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;
let userController = new UserController();

interface IUser {
  username: string
  password: string
  email: string
}

interface IUserResponse {
  id: string
  username: string
  email: string
  is_sso_user: boolean
  sso_user_id: string | null
  sso_from: string | null
  status: string
}

function isIUserResponse(obj: any): obj is IUserResponse {
  const keysOfProps: string[] = [
    'id',
    'username',
    'email',
    'is_sso_user',
    'sso_user_id',
    'sso_from',
    'status'
  ] 
  let result: boolean = true;
  keysOfProps.forEach( (key: string) => {
    result = result && (key in obj)
  })
  return result
}

describe("CRUD User", () => {

  let test_users: IUser[] = [
    {
      username: 'john@email.com',
      password: 'test1234',
      email: 'john@email.com'
    },
    {
      username: 'doe',
      password: 'test5678',
      email: 'doe@email.com'
    },
  ]

  let result_id: any

  beforeAll(async () => {
    // clear user table
    // await userController.truncateUser();
  });

  test("Get users but empty", async () => {
    const res = await request(app).get(`/${api_version}/users`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toEqual(0);
  });

  test("Add user", async () => {
    const res = await request(app).post(`/${api_version}/user`).send(test_users[0]);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
    
    result_id = res.body.id;
  });

  test("Get users", async () => {
    const res = await request(app).get(`/${api_version}/users`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(1);

    res.body.forEach((element: IUserResponse) => {
      expect(isIUserResponse(element)).toBe(true);
    });
  });

  test("Get user", async () => {
    const res = await request(app).get(`/${api_version}/user/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIUserResponse(res.body)).toBe(true);
    expect(res.body.username).toBe(test_users[0].username);

    expect(res.body.email).toBe(test_users[0].email);
    expect(res.body.is_sso_user).toBe(false);
    expect(res.body.sso_user_id).toBe(null);
    expect(res.body.sso_from).toBe(null);

    expect(res.body.status).toBe('active');
  });

  test("Update user", async () => {
    const res = await request(app).put(`/${api_version}/user/${result_id}`).send({
      email: 'joen@email.com',
      is_sso_user: true,
      sso_user_id: 'test',
      sso_from: 'test',
      status: 'inactive'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully update');
  });

  test("Get updated user", async () => {
    const res = await request(app).get(`/${api_version}/user/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIUserResponse(res.body)).toBe(true);
    expect(res.body.username).toBe(test_users[0].username);

    expect(res.body.email).toBe('joen@email.com');
    expect(res.body.is_sso_user).toBe(true);
    expect(res.body.sso_user_id).toBe('test');
    expect(res.body.sso_from).toBe('test');

    expect(res.body.status).toBe('inactive');
  });

  test("Update user not found", async () => {
    const res = await request(app).put(`/${api_version}/user/not_found_user_id`).send({
      email: 'joen@email.com'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: item does not exist');
  });

  test("Add user then add duplicated user", async () => {
    await request(app).post(`/${api_version}/user`).send(test_users[1]);
    const res = await request(app).post(`/${api_version}/user`).send(test_users[1]);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');

    expect(res.body.message).toBe('User: Invalid request');
    expect(res.body.error).toBe('Duplicated username');
  });

  test("Get users again", async () => {
    const res = await request(app).get(`/${api_version}/users`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(2);

    res.body.forEach((element: IUserResponse) => {
      expect(isIUserResponse(element)).toBe(true);
    });
  });

  test("Delete User", async () => {
    const res = await request(app).delete(`/${api_version}/user/${result_id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully delete');
  });

  test("Get deleted User", async () => {
    const res = await request(app).get(`/${api_version}/user/${result_id}`);
    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: item does not exist');
  });

  // afterAll(() => {

  // });
});