import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection

describe("Authenticate User Controller", () => {
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

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "test"
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("token")
    expect(response.body).toHaveProperty("user")
  })

  it("should be able to authenticate a non-existent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "non-existent-user@fin_api.com.br",
      password: "test"
    })

    expect(response.status).toBe(401)
  })

  it("should be able to authenticate an user with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "incorrect-password"
    })

    expect(response.status).toBe(401)
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})