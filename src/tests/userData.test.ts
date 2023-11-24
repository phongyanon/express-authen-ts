import request from "supertest";
import app from "../../app";
import { Controller as VerificationController } from "../v1/verification/controllers";
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as ProfileController } from "../v1/profile/controllers";
import { Controller as UserRoleController } from "../v1/userRole/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import { mockUsers } from "./mockUsers";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;

let tokenController = new TokenController();
let verificationController = new VerificationController();
let profileController = new ProfileController();
let userRoleController = new UserRoleController();
let userController = new UserController();

interface IUserInsert {
	username: string
  password: string
  email: string
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

describe("CRUD User", () => {

  beforeAll( async () => {
    // TODO: create clear user table to script
    try {
      await tokenController.resetToken();
      await verificationController.resetVerification();
      await profileController.resetProfile();
      await userRoleController.resetUserRole();
      await userController.resetUser();

      mockUsers.forEach( async (obj: IUserInsert) => {
        await userController.addUser(obj);
      });

    } catch (err) {
      // do nothing
    }
  });

  test("Get users", async () => {
    const res = await request(app).get(`/${api_version}/users`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(8);
  });

  test("Get users pagination in first page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?page=1&limit=4`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength;

    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total_records');
    expect(res.body.pagination).toHaveProperty('current_page');
    
    expect(res.body.pagination).toHaveProperty('total_pages');
    expect(res.body.pagination).toHaveProperty('next_page');
    expect(res.body.pagination).toHaveProperty('prev_page');

    expect(res.body.pagination.total_records).toBe(8);
    expect(res.body.pagination.current_page).toBe(1);
    expect(res.body.pagination.total_pages).toBe(2);

    expect(res.body.pagination.next_page).toBe(2);
    expect(res.body.pagination.prev_page).toBe(null);
  });

  test("Get users pagination in second page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?page=2&limit=4`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength;

    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total_records');
    expect(res.body.pagination).toHaveProperty('current_page');
    
    expect(res.body.pagination).toHaveProperty('total_pages');
    expect(res.body.pagination).toHaveProperty('next_page');
    expect(res.body.pagination).toHaveProperty('prev_page');

    expect(res.body.pagination.total_records).toBe(8);
    expect(res.body.pagination.current_page).toBe(2);
    expect(res.body.pagination.total_pages).toBe(2);

    expect(res.body.pagination.next_page).toBe(null);
    expect(res.body.pagination.prev_page).toBe(1);
  });

  test("Get users pagination in middle page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?page=2&limit=3`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength;

    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total_records');
    expect(res.body.pagination).toHaveProperty('current_page');
    
    expect(res.body.pagination).toHaveProperty('total_pages');
    expect(res.body.pagination).toHaveProperty('next_page');
    expect(res.body.pagination).toHaveProperty('prev_page');

    expect(res.body.pagination.total_records).toBe(8);
    expect(res.body.pagination.current_page).toBe(2);
    expect(res.body.pagination.total_pages).toBe(3);

    expect(res.body.pagination.next_page).toBe(3);
    expect(res.body.pagination.prev_page).toBe(1);
  });

  test("Get users pagination but single page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?page=1&limit=30`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength;

    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total_records');
    expect(res.body.pagination).toHaveProperty('current_page');
    
    expect(res.body.pagination).toHaveProperty('total_pages');
    expect(res.body.pagination).toHaveProperty('next_page');
    expect(res.body.pagination).toHaveProperty('prev_page');

    expect(res.body.pagination.total_records).toBe(8);
    expect(res.body.pagination.current_page).toBe(1);
    expect(res.body.pagination.total_pages).toBe(1);

    expect(res.body.pagination.next_page).toBe(null);
    expect(res.body.pagination.prev_page).toBe(null);
  });

  test("Get users pagination but ouf of page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?page=2&limit=30`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  test("Get users pagination but page is 0", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?page=0&limit=30`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  test("Get users pagination but limit is 0", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?page=1&limit=0`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  test("Get users pagination but no page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?limit=2`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  test("Get users pagination but no limit", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users?page=1`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  test("Get users pagination but no query", async () => {
    const res = await request(app).get(`/${api_version}/pagination/users`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  // afterAll(() => {
  // });
});