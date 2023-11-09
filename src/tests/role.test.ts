import request from "supertest";
import app from "../../app";
import { Controller as RoleController } from "../v1/role/controllers";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;
let roleController = new RoleController();


export interface IRole {
	name: string
}

export interface IRoleResponse {
	id: string
	name: string
}

function isIRoleResponse(obj: any): obj is IRoleResponse {
  const keysOfProps: string[] = [
    'id',
    'name'
  ] 
  let result: boolean = true;
  keysOfProps.forEach( (key: string) => {
    result = result && (key in obj)
  })
  return result
}

describe("CRUD Role", () => {

  let test_roles: IRole[] = [
    {
      name: 'User'
    },
    {
      name: 'Admin'
    },
  ]

  let result_id: any

  beforeAll( async () => {
    try {
      await roleController.resetRole();
    } catch (err) {
      // do nothing
    }
  });

  test("Get roles but empty", async () => {
    const res = await request(app).get(`/${api_version}/roles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toEqual(0);
  });

  test("Add role", async () => {
    const res = await request(app).post(`/${api_version}/role`).send(test_roles[0]);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
    
    result_id = res.body.id;
  });

  test("Add role some field to error", async () => {
    const res = await request(app).post(`/${api_version}/role`).send({ username: 'some_name' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Get roles", async () => {
    const res = await request(app).get(`/${api_version}/roles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(1);

    res.body.forEach((element: IRoleResponse) => {
      expect(isIRoleResponse(element)).toBe(true);
    });
  });

  test("Get role", async () => {
    const res = await request(app).get(`/${api_version}/role/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIRoleResponse(res.body)).toBe(true);
    expect(res.body.name).toBe(test_roles[0].name);
  });

  test("Update role", async () => {
    const res = await request(app).put(`/${api_version}/role/${result_id}`).send({
      name: 'SuperAdmin'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully update');
  });

  test("Get updated role", async () => {
    const res = await request(app).get(`/${api_version}/role/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIRoleResponse(res.body)).toBe(true);
    expect(res.body.name).toBe('SuperAdmin');
  });

  test("Update role not found", async () => {
    const res = await request(app).put(`/${api_version}/role/9999999`).send({
      name: 'SupremeAdmin'
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Role: update item failed');
  });

  test("Get roles again", async () => {
		await request(app).post(`/${api_version}/role`).send(test_roles[1]);

    const res = await request(app).get(`/${api_version}/roles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(2);

    res.body.forEach((element: IRoleResponse) => {
      expect(isIRoleResponse(element)).toBe(true);
    });
  });

  test("Delete role", async () => {
    const res = await request(app).delete(`/${api_version}/role/${result_id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully delete');
  });

  test("Get deleted role", async () => {
    const res = await request(app).get(`/${api_version}/role/${result_id}`);
    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Role: item does not exist');
  });

  // afterAll(() => {
  // });
});