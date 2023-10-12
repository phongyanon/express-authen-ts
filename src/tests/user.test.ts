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

export interface IUserInsert {
	username?: string
  password?: string
  email?: string
  password_salt?: string
  is_sso_user?: boolean
  sso_user_id?: string | null
  sso_from?: string | null
  status?: string
}

interface IUserResponse {
  id: string
  username: string
  password: string
  password_salt: string
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
    'password',
    'password_salt',
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

  let test_users: IUserInsert[] = [
    {
      username: 'john@email.com',
      password: 'test1234',
      password_salt: 'test',
      email: 'john@email.com',
      is_sso_user: false,
      sso_user_id: null,
      sso_from: null, 
      status: 'active'
    },
    {
      username: 'doe',
      password: 'test5678',
      password_salt: 'test',
      email: 'doe@email.com',
      is_sso_user: false,
      sso_user_id: null,
      sso_from: null, 
      status: 'active'
    },
  ]

  let result_id: any

  beforeAll( async () => {
    // TODO: create clear user table to script
    try {
      await userController.resetUser();
    } catch (err) {
      // do nothing
    }
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

  test("Add user some field to error", async () => {
    const res = await request(app).post(`/${api_version}/user`).send({ username: 'some_name' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
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
    expect(res.body.is_sso_user).toBe(0); // false
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
    expect(res.body.is_sso_user).toBe(1); // true
    expect(res.body.sso_user_id).toBe('test');
    expect(res.body.sso_from).toBe('test');

    expect(res.body.status).toBe('inactive');
  });

  test("Update user not found", async () => {
    const res = await request(app).put(`/${api_version}/user/9999999`).send({
      email: 'joen@email.com'
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: update item failed');
  });

  // test("Add user then add duplicated user", async () => {
  //   await request(app).post(`/${api_version}/user`).send(test_users[1]);
  //   const res = await request(app).post(`/${api_version}/user`).send(test_users[1]);

  //   expect(res.statusCode).toBe(400);
  //   expect(res.body).toHaveProperty('message');
  //   expect(res.body).toHaveProperty('error');

  //   expect(res.body.message).toBe('User: Invalid request');
  //   expect(res.body.error).toBe('Duplicated username');
  // });

  // test("Get users again", async () => {
  //   const res = await request(app).get(`/${api_version}/users`);
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveLength;
  //   expect(res.body.length).toBe(2);

  //   res.body.forEach((element: IUserResponse) => {
  //     expect(isIUserResponse(element)).toBe(true);
  //   });
  // });

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