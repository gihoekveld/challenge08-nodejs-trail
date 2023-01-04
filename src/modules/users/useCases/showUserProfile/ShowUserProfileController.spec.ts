import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations();
    
    const id = uuidV4();
    const password = await hash("test", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'User Test', 'test@fin_api.com.br', '${password}', 'now()', 'now()')
      `
    );
  })

  it("should be able to show an user profile", async() => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "test"
    })

    const { token } = responseAuth.body

    const responseProfile = await request(app).get("/api/v1/profile").send().set({
      Authorization: `Bearer ${token}`
    })

    expect(responseProfile.status).toBe(200)
    expect(responseProfile.body).toEqual({
      id: expect.any(String),
      name: "User Test",
      email: "test@fin_api.com.br",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  it("should not be able to show an user profile to non-authenticated user", async() => {
    const responseProfile = await request(app).get("/api/v1/profile").send()

    expect(responseProfile.status).toBe(401)
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})