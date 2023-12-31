import request from "supertest";
import app from "../../app";
import dotenv from 'dotenv';
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { Controller as VerificationController } from "../v1/verification/controllers";
import { Controller as TokenController } from "../v1/token/controllers";
import { Controller as ProfileController } from "../v1/profile/controllers";
import { Controller as UserRoleController } from "../v1/userRole/controllers";
import { Controller as UserController } from "../v1/user/controllers";
import { 
  hashPassword, 
  genSalt, 
  comparePassword, 
  genAccessToken, 
  genRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken 
} from "../v1/utils/helper";

let tokenController = new TokenController();
let verificationController = new VerificationController();
let profileController = new ProfileController();
let userRoleController = new UserRoleController();
let userController = new UserController();

dotenv.config();
const api_version = process.env.API_VERSION;
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.ACCESS_TOKEN_SECRET;

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

interface ITokenPayload {
  uid: string
  username: string
}

interface IGenerateToken {
  success: boolean
  result: string | null
}

interface IVerifyToken {
  success: boolean
  result: JwtPayload | null
}


describe("Authen method", () => {
  test("Hash password and check is match", async () => {
    let plainText: string = 'hello1234';
    let salt: string = genSalt(5);
    let hash: string = hashPassword(plainText, salt);
    let result: boolean = comparePassword(plainText, hash);

    let result_invalid: boolean = comparePassword('hello4567', hash);
    expect(result).toBe(true);
    expect(result_invalid).toBe(false);
  });

  test("Sign jwt", async () => {
    let payload: ITokenPayload = { uid: '123', username: 'pukkhom' }
    let result_access: IGenerateToken = await genAccessToken(payload);
    let result_refresh: IGenerateToken = await genRefreshToken(payload);

    expect(result_access.success).toBe(true);
    expect(result_refresh.success).toBe(true);

    let verify_access: IVerifyToken = await verifyAccessToken(result_access.result as string);
    let verify_refresh: IVerifyToken = await verifyRefreshToken(result_refresh.result as string);

    expect(verify_access.success).toBe(true);
    expect(verify_refresh.success).toBe(true);

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

  let user_id: string
  let result_access_token: string
  let result_refresh_token: string

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

	test("Sign up", async () => {
    const res = await request(app).post(`/${api_version}/signup`).send(test_users[0]);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully signup');
    
    user_id = res.body.id;
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

    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Duplicated username or email');
  });

  test("Sign up duplicated email", async () => {
    const res = await request(app).post(`/${api_version}/signup`).send({
      username: "kaew2",
      password: "test1234",
      email: "kaew@email.com"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');

    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Duplicated username or email');
  });

	test("Sign in to get token", async () => {
    const res = await request(app).post(`/${api_version}/signin`).send({
      username: test_users[0].username,
      password: test_users[0].password
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('refresh_token');
    expect(res.body).toHaveProperty('access_token');

    result_access_token = res.body.access_token;
    result_refresh_token = res.body.refresh_token;
  });

  test("Sign in with wrong password", async () => {
    const res = await request(app).post(`/${api_version}/signin`).send({
      username: test_users[0].username,
      password: '1234zzzz'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');

    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Invalid username or password');
  });

	test("Get access token status", async () => {
    const res = await request(app)
      .get(`/${api_version}/status/token`)
      .set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('ok');
  });

  test("Get access token status not found", async () => {
    const res = await request(app)
      .get(`/${api_version}/status/token`)
      .set('Authorization', `Bearer Some_token`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Please authenticate');
  });

  test("Change password", async () => {
    const res = await request(app).post(`/${api_version}/password/change`)
      .set('Authorization', `Bearer ${result_access_token}`)
      .send({
        user_id: user_id,
        password: test_users[0].password,
        new_password: "test1111"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('success');
    test_users[0].password = "test1111";

    // check tokens should be revoked.
    const tokens_res = await request(app).get(`/${api_version}/user/tokens/${user_id}`)
    .set('Authorization', `Bearer ${result_access_token}`);

    expect(tokens_res.statusCode).toBe(404);
    expect(tokens_res.body).toHaveProperty('error');
    expect(tokens_res.body).toHaveProperty('message');

    expect(tokens_res.body.error).toBe(true);
    expect(tokens_res.body.message).toBe('Token: item does not exist');

  });

  test("Change password but wrong user_id", async () => {
    const res = await request(app).post(`/${api_version}/password/change`)
      .set('Authorization', `Bearer ${result_access_token}`)
      .send({
        user_id: "wrong_id",
        password: "wrong_password",
        new_password: "test2222"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Access deny');

  });

  test("Change password but wrong password", async () => {
    const res = await request(app).post(`/${api_version}/password/change`)
      .set('Authorization', `Bearer ${result_access_token}`)
      .send({
        user_id: user_id,
        password: "wrong_password",
        new_password: "test2222"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  
    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Invalid password');

  });

  test("Sign in new password", async () => {
    const res = await request(app).post(`/${api_version}/signin`).send({
      username: test_users[0].username,
      password: 'test1111'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('refresh_token');
    expect(res.body).toHaveProperty('access_token');

    result_access_token = res.body.access_token;
    result_refresh_token = res.body.refresh_token;
  });

  test("Forgot password but not found email", async () => {
    const res = await request(app).post(`/${api_version}/password/reset/generate`).send({
      email: 'notfound@email.com'
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  
    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Email does not exist');
  });

  test("Forgot password", async () => {
    const res = await request(app).post(`/${api_version}/password/reset/generate`).send({
      email: test_users[0].email
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('success');
  });

  // User can get own reset password token because it's hashed.
  test("Get forgot password token", async () => {
    const res = await verificationController.getVerificationByUserId(user_id);

    expect(res).toHaveProperty('user_id');
    expect(res).toHaveProperty('reset_password_token');
    expect(res).toHaveProperty('reset_password_token_expires_at');
  });

  test("Reset Forgot password but wrong token", async () => {
    const res = await request(app).put(`/${api_version}/reset/password/${user_id}/fake_token`).send({
      new_password: 'test2222'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  
    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Invalid token or user');
  });

  test("Reset Forgot password but wrong user_id", async () => {
    const res = await request(app).put(`/${api_version}/reset/password/9999999/fake_token`).send({
      new_password: 'test2222'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  
    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Invalid token or user');
  });

  // test in postman
  // test("Reset Forgot password", async () => {
  //   const res = await request(app).put(`/${api_version}/reset/password/${user_id}/${reset_password_token}`).send({
  //     new_password: 'test2222'
  //   });

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty('message');
  //   expect(res.body.message).toBe('success');
  // });

  test("Generate verify email token but not found email", async () => {
    const res = await request(app).post(`/${api_version}/email/token/generate`).send({
      email: 'notfound@email.com'
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  
    expect(res.body.message).toBe('Authen: Invalid request');
    expect(res.body.error).toBe('Email does not exist');
  });

  test("Generate verify email token", async () => {
    const res = await request(app).post(`/${api_version}/email/token/generate`).send({
      email: test_users[0].email
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('success');
  });

  test("Get verify email token", async () => {
    const res = await verificationController.getVerificationByUserId(user_id);

    expect(res).toHaveProperty('user_id');
    expect(res).toHaveProperty('verify_email_token');
    expect(res).toHaveProperty('verify_email_token_expires_at');
  });

  // test in postman
  // test("Verify email token but not found email", async () => {
  //   const res = await request(app).post(`/${api_version}/email/token/verify?user_id=${user_id}&token=${verify_email_token}`)

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty('message');
  //   expect(res.body.message).toBe('success');
  // });

  test("View User's roles", async () => {
    const res = await request(app)
      .get(`/${api_version}/role/user/${user_id}`)
      .set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('User');
  });

  test("Role User access", async () => {
    const res = await request(app)
      .get(`/${api_version}/test/role/user`)
      .set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('ok');
  });

  test("Role User access both", async () => {
    const res = await request(app)
      .get(`/${api_version}/test/roles/user/admin`)
      .set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('ok');
  });

  test("Role Admin access deny", async () => {
    const res = await request(app)
      .get(`/${api_version}/test/role/admin`)
      .set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Unauthirize to access this route');
  });

  test("Refresh token to get new access token", async () => {
    const res_token = await request(app).post(`/${api_version}/auth/refresh/token`).send({
      refresh_token: result_refresh_token
    });
    expect(res_token.statusCode).toBe(200);

    expect(res_token.body).toHaveProperty('access_token');
  });

  test("Refresh token to get new refresh token", async () => {
    const res_token = await request(app).post(`/${api_version}/auth/refresh/tokens`).send({
      refresh_token: result_refresh_token
    });
    expect(res_token.statusCode).toBe(200);

    expect(res_token.body).toHaveProperty('access_token');
    expect(res_token.body).toHaveProperty('refresh_token');
  });

  test("Expired Refresh token to get new access token", async () => {
    const res_token = await request(app).post(`/${api_version}/auth/refresh/token`).send({
      refresh_token: 'some_expired_token'
    });
    expect(res_token.statusCode).toBe(500);

  });

  test("Expired Refresh token to get new refresh token", async () => {
    const res_token = await request(app).post(`/${api_version}/auth/refresh/tokens`).send({
      refresh_token: 'some_expired_token'
    });
    expect(res_token.statusCode).toBe(500);

  });

	test("Sign out", async () => {
    const res = await request(app)
      .post(`/${api_version}/signout`)
      .set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('signout');
  });

  // Front-end should delete all tokens
	// test("Get access token status after sign out", async () => {
  //   const res = await request(app)
  //     .get(`/${api_version}/status/token`)
  //     .set('Authorization', `Bearer ${result_access_token}`);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty('status');
  //   expect(res.body.status).toBe('expired');
  // });

  test("Revoke tokens", async () => {
    const signin_res = await request(app).post(`/${api_version}/signin`).send({
      username: test_users[0].username,
      password: test_users[0].password
    });

    expect(signin_res.statusCode).toBe(200);
    result_access_token = signin_res.body.access_token;
    result_refresh_token = signin_res.body.refresh_token;

    const res = await request(app)
      .post(`/${api_version}/revoke/token/${user_id}`)
      .set('Authorization', `Bearer ${result_access_token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('success');
  });

  // User terminate own user then frontend should clear access and refresh tokens (user can't delete User).
  test("Terminate User not found", async () => {
    const signin_res = await request(app).post(`/${api_version}/signin`).send({
      username: test_users[0].username,
      password: test_users[0].password
    });

    expect(signin_res.statusCode).toBe(200);
    result_access_token = signin_res.body.access_token;
    result_refresh_token = signin_res.body.refresh_token;

    const res = await request(app).post(`/${api_version}/user/terminate`)
      .send({user_id: 'test_user_id'})
      .set('Authorization', `Bearer ${result_access_token}`);;
    expect(res.statusCode).toBe(401);
    
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Access deny');
  });

  test("Terminate User", async () => {
    const res = await request(app).post(`/${api_version}/user/terminate`)
      .send({user_id: user_id})
      .set('Authorization', `Bearer ${result_access_token}`);;
    expect(res.statusCode).toBe(200);
    
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('success');
  });

  test("Terminate User can not sign in", async () => {
    const res = await request(app).post(`/${api_version}/signin`).send({
      username: test_users[0].username,
      password: test_users[0].password
    });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Unauthirize to access this route');
  });

  test("Terminate User can not get new access token", async () => {
    const res = await request(app).post(`/${api_version}/auth/refresh/token`).send({
      refresh_token: result_refresh_token
    });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Unauthirize to access this route');
  });

  test("Terminate User can not get new refresh token", async () => {
    const res = await request(app).post(`/${api_version}/auth/refresh/tokens`).send({
      refresh_token: result_refresh_token
    });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Unauthirize to access this route');
  });

});