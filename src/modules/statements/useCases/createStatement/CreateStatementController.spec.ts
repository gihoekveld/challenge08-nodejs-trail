import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection

describe("Create Statement Controller", () => {
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

  it("should be able to create a new statement deposit", async() => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "test"
    })

    const { token } = responseAuth.body

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.00,
        description: "Deposit test"
      })
      .set({ Authorization: `Bearer ${token}` })

    expect(responseStatement.status).toBe(201)
    expect(responseStatement.body).toEqual({
      id: expect.any(String),
      user_id: expect.any(String),
      type: "deposit",
      amount: 100.00,
      description: "Deposit test",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  it("should not be able to create a new statement deposit to non-authenticated user", async() => {
    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.00,
        description: "Deposit test"
      })

    expect(responseStatement.status).toBe(401)
  })

  it("should be able to create a new statement withdraw", async() => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "test"
    })

    const { token } = responseAuth.body

    const responseStatement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 40.00,
        description: "Withdraw test"
      })
      .set({ Authorization: `Bearer ${token}` })

    expect(responseStatement.status).toBe(201)
    expect(responseStatement.body).toEqual({
      id: expect.any(String),
      user_id: expect.any(String),
      type: "withdraw",
      amount: 40.00,
      description: "Withdraw test",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  it("should not be able to create a new statement withdraw if the user has insufficient funds", async() => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "test"
    })

    const { token } = responseAuth.body

    const responseStatement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 61.00,
        description: "Withdraw test"
      })
      .set({ Authorization: `Bearer ${token}` })

    expect(responseStatement.status).toBe(400)
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})