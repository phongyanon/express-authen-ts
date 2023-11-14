import request from "supertest";
import app from "../../app";
import { Controller as VerificationController } from "../v1/verification/controllers";
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as ProfileController } from "../v1/profile/controllers";
import { Controller as UserRoleController } from "../v1/userRole/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;

let tokenController = new TokenController();
let verificationController = new VerificationController();
let profileController = new ProfileController();
let userRoleController = new UserRoleController();
let userController = new UserController();

describe("Test Role Permission", () => {

	let user_id: any
	let result_access_token: any
	let other_user_id: any

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

  test("Prepare users", async () => {
		const res_user = await request(app).post(`/${api_version}/signup`).send({
      username: "lisa",
      password: "test1234",
      email: "lisa@email.com"
    });

		const other_res_user = await request(app).post(`/${api_version}/signup`).send({
      username: "rose",
      password: "test1234",
      email: "rose@email.com"
    });
    
		expect(res_user.statusCode).toBe(200);
		expect(other_res_user.statusCode).toBe(200);
    user_id = res_user.body.id;
		other_user_id = other_res_user.body.id;

		const res = await request(app).post(`/${api_version}/signin`).send({
      username: "lisa",
      password: "test1234"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('refresh_token');
    expect(res.body).toHaveProperty('access_token');

    result_access_token = res.body.access_token;
  });

  test("Get own user data", async () => {
    const res = await request(app)
			.get(`/${api_version}/user/${user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("lisa");

    expect(res.body.email).toBe("lisa@email.com");
    expect(res.body.is_sso_user).toBe(false);
    expect(res.body.sso_user_id).toBe(null);
    expect(res.body.sso_from).toBe(null);

    expect(res.body.status).toBe('active');
  });

	test("Get other user data", async () => {
    const res = await request(app)
			.get(`/${api_version}/user/${other_user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Access deny');
  });

	// test("Get own user tokens", async () => {
  //   const res = await request(app)
	// 		.get(`/${api_version}/user/tokens/${user_id}`)
	// 		.set('Authorization', `Bearer ${result_access_token}`);

	// 		expect(res.statusCode).toBe(200);
	// 		expect(res.body).toHaveLength;
	// 		expect(res.body.length).toBe(1);
  // });

	// test("Get other user tokens", async () => {
  //   const res = await request(app)
	// 		.get(`/${api_version}/user/tokens/${other_user_id}`)
	// 		.set('Authorization', `Bearer ${result_access_token}`);
			
  //   expect(res.statusCode).toBe(401);
  //   expect(res.body.message).toBe('Access deny');
  // });

	test("Add other user profile", async () => {
    const res = await request(app)
			.post(`/${api_version}/user/profile/${other_user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`).send({
				user_id: user_id.toString(),
				first_name_EN: 'Lisa2',
				last_name_EN: 'Lalala2',
				first_name_TH: 'ลิซ่า',
				last_name_TH: 'ลาลาลา',
				gender: 'female',
				date_of_birth: 1641600000,
				address_EN: 'test address',
				address_TH: 'ทดสอบ',
				zip_code: 37000,
				phone: '+66939999988',
				image_profile: 'test_url'
			});

			expect(res.statusCode).toBe(401);
			expect(res.body.message).toBe('Access deny');
  });

	test("Add own user profile", async () => {
    const res = await request(app)
			.post(`/${api_version}/user/profile/${user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`).send({
				user_id: user_id.toString(),
				first_name_EN: 'Lisa',
				last_name_EN: 'Lalala',
				first_name_TH: 'ลิซ่า',
				last_name_TH: 'ลาลาลา',
				gender: 'female',
				date_of_birth: 1641600000,
				address_EN: 'test address',
				address_TH: 'ทดสอบ',
				zip_code: 37000,
				phone: '+66939999988',
				image_profile: 'test_url'
			});

		expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
  });

	test("Get own user profile", async () => {
    const res = await request(app)
			.get(`/${api_version}/user/profile/${user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('user_id');

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

		expect(res.body.user_id).toBe(user_id.toString());
	
		expect(res.body.first_name_EN).toBe('Lisa');
		expect(res.body.last_name_EN).toBe('Lalala');
		expect(res.body.first_name_TH).toBe('ลิซ่า');
		expect(res.body.last_name_TH).toBe('ลาลาลา');

		expect(res.body.gender).toBe('female');
		expect(res.body.date_of_birth).toBe(1641600000);
		expect(res.body.address_EN).toBe('test address');
		expect(res.body.address_TH).toBe('ทดสอบ');

		expect(res.body.zip_code).toBe(37000);
		expect(res.body.phone).toBe('+66939999988');
		expect(res.body.image_profile).toBe('test_url');
  });

	test("Get other user profile", async () => {
    const res = await request(app)
			.get(`/${api_version}/user/profile/${other_user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`);
			
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Access deny');
  });

	test("Update own user profile", async () => {
    const res = await request(app)
			.put(`/${api_version}/user/profile/${user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`).send({
				address_EN: 'test address2',
				address_TH: 'ทดสอบ2',
				zip_code: 47000
			});

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body).toHaveProperty('id');
		expect(res.body.message).toBe('Successfully update');
  });

	test("Get own user profile again", async () => {
    const res = await request(app)
			.get(`/${api_version}/user/profile/${user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`);

		expect(res.statusCode).toBe(200);

		expect(res.body.user_id).toBe(user_id.toString());
		expect(res.body.address_EN).toBe('test address2');
		expect(res.body.address_TH).toBe('ทดสอบ2');
		expect(res.body.zip_code).toBe(47000);
  });

	test("Update other user profile", async () => {
    const res = await request(app)
			.put(`/${api_version}/user/profile/${other_user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`).send({
				zip_code: 47001
			});

		expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Access deny');
  });

	test("Get own user verification", async () => {
    const res = await request(app)
			.get(`/${api_version}/user/verification/${user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`);

		expect(res.statusCode).toBe(200);
    expect(res.body.user_id).toBe(user_id.toString());
		expect(res.body.reset_password_token).toBe(null);

		expect(res.body.verify_email_token).toBe(null);
    expect(res.body.email_verified).toBe(false);
    expect(res.body.enable_opt).toBe(false);

		expect(res.body.otp_secret).toBe(null);
		expect(res.body.otp_verified).toBe(false);
		expect(res.body.token_salt).toBe('');
  });

	test("Get other user verification", async () => {
    const res = await request(app)
			.get(`/${api_version}/user/verification/${other_user_id}`)
			.set('Authorization', `Bearer ${result_access_token}`);
			
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Access deny');
  });

	test("Revoke other user tokens", async () => {
    const res = await request(app)
      .post(`/${api_version}/revoke/token/${other_user_id}`)
      .set('Authorization', `Bearer ${result_access_token}`);

		expect(res.statusCode).toBe(401);
		expect(res.body.message).toBe('Access deny');
  });

	test("Revoke own user tokens", async () => {
    const res = await request(app)
      .post(`/${api_version}/revoke/token/${user_id}`)
      .set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('success');
  });

  // afterAll(() => {
  // });
});