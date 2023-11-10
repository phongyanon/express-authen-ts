import request from "supertest";
import app from "../../app";
import { Controller as SettingController } from "../v1/setting/controllers";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;
let settingController = new SettingController();

export interface ISettingInsert {
	reset_password_interval: number,
  enable_reset_password_interval: boolean,
  enable_verify_email: boolean,
}

export interface ISettingResponse {
	id: string,
	reset_password_interval: number,
  enable_reset_password_interval: boolean,
  enable_verify_email: boolean,
}

function isISettingResponse(obj: any): obj is ISettingResponse {
  const keysOfProps: string[] = [
    'id',
    'reset_password_interval',
		'enable_reset_password_interval',
		'enable_verify_email'
  ] 
  let result: boolean = true;
  keysOfProps.forEach( (key: string) => {
    result = result && (key in obj)
  })
  return result
}

describe("CRUD Setting", () => {

  let test_settings: ISettingInsert[] = [
    {
      reset_password_interval: 90,
  		enable_reset_password_interval: false,
  		enable_verify_email: false,
    },
    {
      reset_password_interval: 30,
  		enable_reset_password_interval: false,
  		enable_verify_email: false,
    },
  ]

  let result_id: any

  beforeAll( async () => {
    try {
			await settingController.resetSetting();
		} catch (err) {
      // do nothing
    }
  });

  test("Get settings but empty", async () => {
    const res = await request(app).get(`/${api_version}/settings`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toEqual(0);
  });

  test("Add setting", async () => {
    const res = await request(app).post(`/${api_version}/setting`).send(test_settings[0]);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully create');
    
    result_id = res.body.id;
  });

  test("Add setting some field to error", async () => {
    const res = await request(app).post(`/${api_version}/setting`).send({ username: 'some_name' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test("Get settings", async () => {
    const res = await request(app).get(`/${api_version}/settings`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(1);

    res.body.forEach((element: ISettingResponse) => {
      expect(isISettingResponse(element)).toBe(true);
    });
  });

  test("Get setting", async () => {
    const res = await request(app).get(`/${api_version}/setting/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isISettingResponse(res.body)).toBe(true);

		expect(res.body.reset_password_interval).toBe(90);
		expect(res.body.enable_reset_password_interval).toBe(false);
		expect(res.body.enable_verify_email).toBe(false);
  });

  test("Update setting", async () => {
    const res = await request(app).put(`/${api_version}/setting/${result_id}`).send({
      reset_password_interval: 60,
			enable_verify_email: true
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully update');
  });

  test("Get updated setting", async () => {
    const res = await request(app).get(`/${api_version}/setting/${result_id}`);
    expect(res.statusCode).toBe(200);
    expect(isISettingResponse(res.body)).toBe(true);
    expect(res.body.reset_password_interval).toBe(60);
    expect(res.body.enable_verify_email).toBe(true);
  });

  test("Update setting not found", async () => {
    const res = await request(app).put(`/${api_version}/setting/9999999`).send({
      enable_verify_email: false,
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Setting: update item failed');
  });

  test("Get settings again", async () => {
		await request(app).post(`/${api_version}/setting`).send(test_settings[1]);

    const res = await request(app).get(`/${api_version}/settings`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength;
    expect(res.body.length).toBe(2);

    res.body.forEach((element: ISettingResponse) => {
      expect(isISettingResponse(element)).toBe(true);
    });
  });

  test("Delete setting", async () => {
    const res = await request(app).delete(`/${api_version}/setting/${result_id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('id');
    expect(res.body.message).toBe('Successfully delete');
  });

  test("Get deleted setting", async () => {
    const res = await request(app).get(`/${api_version}/setting/${result_id}`);
    expect(res.statusCode).toBe(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Setting: item does not exist');
  });

  // afterAll(() => {
  // });
});