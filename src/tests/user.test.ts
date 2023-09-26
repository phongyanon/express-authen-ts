import request from "supertest";
import app from "../../app";

const api_version: string = 'v1';

interface IUser {
  username: string
  password: string
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
  // const keysOfProps = keys<IUserResponse>();
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
      password: 'test1234'
    },
    {
      username: 'doe@email.com',
      password: 'test5678'
    },
  ]

  let result: any

  beforeAll(() => {
    // clear user table
  });

  test("Get users but empty", async () => {
    const res = await request(app).get(`/${api_version}/users`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    res.body.forEach((element: IUserResponse) => {
      expect(isIUserResponse(element)).toBe(true);
    });
  });

  // test("Add user", async () => {
  
  // });

  // test("Get user", async () => {
  
  // });

  // test("Get updated user", async () => {
  
  // });

  // test("Add user again", async () => {
  
  // });

  // test("Add duplicated user", async () => {
  
  // });

  // test("Get users", async () => {
  
  // });

  // test("Delete User", async () => {
  
  // });

  // test("Get deleted User", async () => {
  
  // });

  // afterAll(() => {

  // });
});