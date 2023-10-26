import request from "supertest";
import app from "../../app";
import dotenv from 'dotenv';

dotenv.config();
const api_version = process.env.API_VERSION;

describe("Authentication", () => {
  
	test("Sign up", async () => {

  });

	test("Sign up duplicated username", async () => {

  });

	test("Sign in to get token", async () => {

  });

	test("Verify token", async () => {

  });

	test("Sign out", async () => {

  });

	test("Verify token after sign out", async () => {

  });

});