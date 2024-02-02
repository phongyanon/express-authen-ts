import request from "supertest";
import app from "../../app";
import { Controller as VerificationController } from "../v1/verification/controllers";
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as ProfileController } from "../v1/profile/controllers";
import { Controller as UserRoleController } from "../v1/userRole/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import { mockUsers } from "./mockUsers";
import { IProfileInsert } from "./profile.test";
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

const prepareUsers = () => {
  return new Promise(async resolve => {
    mockUsers.forEach( async (obj: IUserInsert) => {
      let add_res: any = await userController.addUser(obj);
      await profileController.addProfile({
        user_id: add_res.id,
        first_name_EN: `Firstname${add_res.id}`,
        last_name_EN: `Lastname${add_res.id}`,
        first_name_TH: `คน${add_res.id}`,
        last_name_TH: `สวย${add_res.id}`,
        gender: 'female',
        date_of_birth: 1699516723,
        address_EN: 'home',
        address_TH: 'บ้าน',
        zip_code: 23000,
        phone: "+66939999999",
        image_profile: 'test'
      });
    });
    resolve(true)
  });
}

describe("CRUD User", () => {

  let user_id: string

  beforeAll( async () => {
    // TODO: create clear user table to script
    try {
      await tokenController.resetToken();
      await verificationController.resetVerification();
      await profileController.resetProfile();
      await userRoleController.resetUserRole();
      await userController.resetUser();

      await prepareUsers();

    } catch (err) {
      // do nothing
    }
  });

  test("Get users", async () => {
    const res = await userController.getUsers();
    expect(res).toHaveLength;
    console.log('>>> ', res)
  });

  test("Search users by username", async () => {
    const res = await request(app).get(`/${api_version}/users/search?name=jojo&limit=4`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Search users by username but not found", async () => {
    const res = await request(app).get(`/${api_version}/users/search?name=zzz&limit=4`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(0);
  });

  test("Search users by username but limit is 0", async () => {
    const res = await request(app).get(`/${api_version}/users/search?name=jojo&limit=0`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  test("Search users by username but no name", async () => {
    const res = await request(app).get(`/${api_version}/users/search?limit=4`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  test("Search users by username but no limit", async () => {
    const res = await request(app).get(`/${api_version}/users/search?name=jojo`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
  });

  test("Search users by username but no query", async () => {
    const res = await request(app).get(`/${api_version}/users/search`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: Invalid request');
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

  test("Get profiles pagination in first page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/profiles?page=1&limit=4`);
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

  test("Get profiles pagination but ouf of page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/profiles?page=2&limit=30`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Profile: Invalid request');
  });

  test("Get profiles pagination but page is 0", async () => {
    const res = await request(app).get(`/${api_version}/pagination/profiles?page=0&limit=30`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Profile: Invalid request');
  });

  test("Get profiles pagination but limit is 0", async () => {
    const res = await request(app).get(`/${api_version}/pagination/profiles?page=1&limit=0`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Profile: Invalid request');
  });

  test("Get profiles pagination but no page", async () => {
    const res = await request(app).get(`/${api_version}/pagination/profiles?limit=2`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Profile: Invalid request');
  });

  test("Get profiles pagination but no limit", async () => {
    const res = await request(app).get(`/${api_version}/pagination/profiles?page=1`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Profile: Invalid request');
  });

  test("Get profiles pagination but no query", async () => {
    const res = await request(app).get(`/${api_version}/pagination/profiles`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Profile: Invalid request');
  });

  test("Prepare user profile", async () => {
    const res_user = await request(app).post(`/${api_version}/signup`).send({
      username: 'jennie@email.com',
      password: 'test1234',
      password_salt: 'test',
      email: 'jennie@email.com',
      is_sso_user: false,
      sso_user_id: null,
      sso_from: null, 
      status: 'active'
    });

    expect(res_user.statusCode).toBe(200);
    expect(res_user.body).toHaveProperty('message');
    expect(res_user.body).toHaveProperty('id');
    expect(res_user.body.message).toBe('Successfully signup');
    
    user_id = res_user.body.id;

    // add profile
    const res = await request(app).post(`/${api_version}/user/profile/${user_id}`).send({
      user_id: user_id,
			first_name_EN: 'jennie',
			last_name_EN: 'ki',
			first_name_TH: 'เจนนี่',
			last_name_TH: 'คิ',
			gender: 'female',
			date_of_birth: 1641600000,
			address_EN: 'test address',
			address_TH: 'ทดสอบ',
			zip_code: 28000,
			phone: '+66939999999',
			image_profile: 'test_url'
    });
    expect(res.statusCode).toBe(201);

  });

  test("Get user profile", async () => {
    const res = await request(app).get(`/${api_version}/user/data/profile/${user_id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user_id');
    expect(res.body).toHaveProperty('profile_id');

    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('is_sso_user');
    expect(res.body).toHaveProperty('sso_user_id');

    expect(res.body).toHaveProperty('sso_from');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('first_name_EN');
    expect(res.body).toHaveProperty('last_name_EN');

    expect(res.body).toHaveProperty('first_name_TH');
    expect(res.body).toHaveProperty('last_name_TH');
    expect(res.body).toHaveProperty('gender');
    expect(res.body).toHaveProperty('date_of_birth');

    expect(res.body).toHaveProperty('address_EN');
    expect(res.body).toHaveProperty('address_TH');
    expect(res.body).toHaveProperty('zip_code');

    expect(res.body).toHaveProperty('phone');
    expect(res.body).toHaveProperty('image_profile');
  });

  test("Get user profile but not found", async () => {
    const res = await request(app).get(`/${api_version}/user/data/profile/9999999`);
    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User: item does not exist');
  });

  // afterAll(() => {
  // });
});