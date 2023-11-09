import request from "supertest";
import app from "../../app";
import { Controller as RoleController } from "../v1/role/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import { Controller as UserRoleController } from "../v1/userRole/controllers";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;
let roleController = new RoleController();
let userController = new UserController();
let userRoleController = new UserRoleController();

export interface IUserRole {
	user_id: string
	role_id: string
}

export interface IUserRoleInsert {
	user_id: string
	role_id: string
}

export interface IUserRoleResponse {
	id: string
	user_id: string
	role_id: string
}

function isIUserRoleResponse(obj: any): obj is IUserRoleResponse {
  const keysOfProps: string[] = [
    'id',
    'user_id',
		'role_id'
  ] 
  let result: boolean = true;
  keysOfProps.forEach( (key: string) => {
    result = result && (key in obj)
  })
  return result
}

describe("CRUD UserRole", () => {

  let test_userRoles: IUserRole[] = [
    {
      user_id: '1',
			role_id: '1'
    },
    {
      user_id: '2',
			role_id: '2'
    },
  ]

  let result_id: any
	let user_id: any

  beforeAll( async () => {
    try {
			await userRoleController.resetUserRole();
      await roleController.resetRole();
			await userController.resetUser();
    } catch (err) {
      // do nothing
    }
  });

  test("Get userRoles but empty", async () => {
    const res = await request(app).get(`/${api_version}/userRoles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toEqual(0);
  });

  test("Add userRole", async () => {
		const role_res = await request(app).post(`/${api_version}/role`).send({name: 'User'});
		const user_res = await request(app).post(`/${api_version}/user`).send({
			username: 'john@email.com',
			password: 'test1234',
			password_salt: 'test',
			email: 'john@email.com',
			is_sso_user: false,
			sso_user_id: null,
			sso_from: null, 
			status: 'active'
		});

		test_userRoles[0].user_id = user_res.body.id;
		test_userRoles[0].role_id = role_res.body.id;
		test_userRoles[1].role_id = role_res.body.id;

    const res = await request(app).post(`/${api_version}/userRole`).send(test_userRoles[0]);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
    
    result_id = res.body.id;
  });

  test("Add userRole some field to error", async () => {
    const res = await request(app).post(`/${api_version}/userRole`).send({ username: 'some_name' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Get userRoles", async () => {
    const res = await request(app).get(`/${api_version}/userRoles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(1);

    res.body.forEach((element: IUserRoleResponse) => {
      expect(isIUserRoleResponse(element)).toBe(true);
    });
  });

  test("Get userRole", async () => {
    const res = await request(app).get(`/${api_version}/userRole/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIUserRoleResponse(res.body)).toBe(true);
    expect(res.body.user_id).toBe(test_userRoles[0].user_id.toString());
		expect(res.body.role_id).toBe(test_userRoles[0].role_id.toString());
  });

  test("Update userRole", async () => {
		const user_res = await request(app).post(`/${api_version}/user`).send({
			username: 'deo@email.com',
			password: 'test1234',
			password_salt: 'test',
			email: 'deo@email.com',
			is_sso_user: false,
			sso_user_id: null,
			sso_from: null, 
			status: 'active'
		});

		user_id = user_res.body.id;
		test_userRoles[1].user_id = user_res.body.id;
    const res = await request(app).put(`/${api_version}/userRole/${result_id}`).send({
      user_id: user_res.body.id
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully update');
  });

  test("Get updated userRole", async () => {
    const res = await request(app).get(`/${api_version}/userRole/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIUserRoleResponse(res.body)).toBe(true);
    expect(res.body.user_id).toBe(user_id.toString());
  });

  test("Update userRole not found", async () => {
    const res = await request(app).put(`/${api_version}/userRole/9999999`).send({
      user_id: user_id
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('UserRole: update item failed');
  });

  test("Get userRoles again", async () => {
		await request(app).post(`/${api_version}/userRole`).send(test_userRoles[1]);

    const res = await request(app).get(`/${api_version}/userRoles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(2);

    res.body.forEach((element: IUserRoleResponse) => {
      expect(isIUserRoleResponse(element)).toBe(true);
    });
  });

  test("Delete userRole", async () => {
    const res = await request(app).delete(`/${api_version}/userRole/${result_id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully delete');
  });

  test("Get deleted userRole", async () => {
    const res = await request(app).get(`/${api_version}/userRole/${result_id}`);
    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('UserRole: item does not exist');
  });

  // afterAll(() => {
  // });
});