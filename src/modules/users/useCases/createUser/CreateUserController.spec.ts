import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations();
  })

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "test@fin_api.com.br",
      password: "test"
    })

    expect(response.status).toBe(201)
  })

  it("should not be able to create an already exists user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "test@fin_api.com.br",
      password: "test"
    })

    expect(response.status).toBe(400)
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})