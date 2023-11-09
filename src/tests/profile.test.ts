import request from "supertest";
import app from "../../app";
import { Controller as UserController } from "../v1/user/controllers";
import { Controller as ProfileController } from "../v1/profile/controllers";
import { Controller as UserRoleController } from "../v1/userRole/controllers";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;
let profileController = new ProfileController();
let userController = new UserController();
let userRoleController = new UserRoleController();

export interface IProfileInsert {
	user_id: string,
	first_name_EN?: string,
	last_name_EN?: string,
	first_name_TH?: string | null,
	last_name_TH?: string | null,
	gender?: string,
	date_of_birth?: number,
	address_EN?: string,
	address_TH?: string | null,
	zip_code?: number,
	phone?: string,
	image_profile?: string | null
}

export interface IProfileResponse {
	id: string,
	user_id: string,
	first_name_EN: string,
	last_name_EN: string,
	first_name_TH: string,
	last_name_TH: string,
	gender: string,
	date_of_birth: number,
	address_EN: string,
	address_TH: string,
	zip_code: number,
	phone: string,
	image_profile: string
}

function isIProfileResponse(obj: any): obj is IProfileResponse {
  const keysOfProps: string[] = [
    'id',
    'user_id',
		'first_name_EN',
		'last_name_EN',
		'first_name_TH',
		'last_name_TH',
		'gender',
		'date_of_birth',
		'address_EN',
		'address_TH',
		'zip_code',
		'phone',
		'image_profile'
  ] 
  let result: boolean = true;
  keysOfProps.forEach( (key: string) => {
    result = result && (key in obj)
  })
  return result
}

describe("CRUD Profile", () => {

  let test_profiles: IProfileInsert[] = [
    {
      user_id: 'test',
			first_name_EN: 'John',
			last_name_EN: 'Doe',
			first_name_TH: 'John', //'จอน',
			last_name_TH: 'Doe', //'โด',
			gender: 'male',
			date_of_birth: 1641600000,
			address_EN: 'test address',
			address_TH: 'test address', //'ทดสอบ',
			zip_code: 27000,
			phone: '+66939999999',
			image_profile: 'test_url'
    },
    {
      user_id: 'test',
			first_name_EN: 'Jane',
			last_name_EN: 'Dee',
			first_name_TH: 'เจน',
			last_name_TH: 'ดีย์',
			gender: 'female',
			date_of_birth: 1681600000,
			address_EN: 'test address',
			address_TH: 'ทดสอบ',
			zip_code: 37000,
			phone: '+66939999988',
			image_profile: 'test_url'
    },
  ]

  let result_id: any
	let user_id: any

  beforeAll( async () => {
    try {
			await profileController.resetProfile();
			await userRoleController.resetUserRole();
			await userController.resetUser();
		} catch (err) {
      // do nothing
    }
  });

  test("Get Profiles but empty", async () => {
    const res = await request(app).get(`/${api_version}/profiles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toEqual(0);
  });

  test("Add Profile", async () => {
		const user1_res = await request(app).post(`/${api_version}/user`).send({
			username: 'john@email.com',
			password: 'test1234',
			password_salt: 'test',
			email: 'john@email.com',
			is_sso_user: false,
			sso_user_id: null,
			sso_from: null, 
			status: 'active'
		});

		const user2_res = await request(app).post(`/${api_version}/user`).send({
			username: 'jane@email.com',
			password: 'test1234',
			password_salt: 'test',
			email: 'jane@email.com',
			is_sso_user: false,
			sso_user_id: null,
			sso_from: null, 
			status: 'active'
		});

		test_profiles[0].user_id = user1_res.body.id;
		test_profiles[1].user_id = user2_res.body.id;
		user_id = user1_res.body.id;

    const res = await request(app).post(`/${api_version}/profile`).send(test_profiles[0]);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
    
    result_id = res.body.id;
  });

  test("Add profile some field to error", async () => {
    const res = await request(app).post(`/${api_version}/profile`).send({ username: 'some_name' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Get profiles", async () => {
    const res = await request(app).get(`/${api_version}/profiles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(1);

    res.body.forEach((element: IProfileResponse) => {
      expect(isIProfileResponse(element)).toBe(true);
    });
  });

  test("Get profile", async () => {
    const res = await request(app).get(`/${api_version}/profile/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIProfileResponse(res.body)).toBe(true);
    expect(res.body.user_id).toBe(test_profiles[0].user_id.toString());

		expect(res.body.first_name_EN).toBe(test_profiles[0].first_name_EN);
		expect(res.body.last_name_EN).toBe(test_profiles[0].last_name_EN);
		expect(res.body.first_name_TH).toBe(test_profiles[0].first_name_TH);
		expect(res.body.last_name_TH).toBe(test_profiles[0].last_name_TH);

		expect(res.body.gender).toBe(test_profiles[0].gender);
		expect(res.body.date_of_birth).toBe(test_profiles[0].date_of_birth);
		expect(res.body.address_EN).toBe(test_profiles[0].address_EN);
		expect(res.body.address_TH).toBe(test_profiles[0].address_TH);

		expect(res.body.zip_code).toBe(test_profiles[0].zip_code);
		expect(res.body.phone).toBe(test_profiles[0].phone);
		expect(res.body.image_profile).toBe(test_profiles[0].image_profile);

  });

  test("Update profile", async () => {
    const res = await request(app).put(`/${api_version}/profile/${result_id}`).send({
      address_EN: 'new_address',
			address_TH: 'ทดสอบใหม่'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully update');
  });

  test("Get updated profile", async () => {
    const res = await request(app).get(`/${api_version}/profile/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isIProfileResponse(res.body)).toBe(true);
    expect(res.body.address_EN).toBe('new_address');
    expect(res.body.address_TH).toBe('ทดสอบใหม่');
  });

  test("Update profile not found", async () => {
    const res = await request(app).put(`/${api_version}/profile/9999999`).send({
      address_EN: 'new_address_again',
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Profile: update item failed');
  });

  test("Get profiles again", async () => {
		await request(app).post(`/${api_version}/profile`).send(test_profiles[1]);

    const res = await request(app).get(`/${api_version}/profiles`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(2);

    res.body.forEach((element: IProfileResponse) => {
      expect(isIProfileResponse(element)).toBe(true);
    });
  });

  test("Delete profile", async () => {
    const res = await request(app).delete(`/${api_version}/profile/${result_id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully delete');
  });

  test("Get deleted profile", async () => {
    const res = await request(app).get(`/${api_version}/profile/${result_id}`);
    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Profile: item does not exist');
  });

  // afterAll(() => {
  // });
});