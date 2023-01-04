import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection

describe("Get Balance Controller", () => {
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

  it("should be able to get balance", async() => {
    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "test@fin_api.com.br",
      password: "test"
    })

    const { token } = responseAuth.body

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200.00,
        description: "Deposit test"
      })
      .set({ Authorization: `Bearer ${token}` })

      await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 40.00,
        description: "Withdraw test"
      })
      .set({ Authorization: `Bearer ${token}` })

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(responseBalance.status).toBe(200)
    expect(responseBalance.body).toEqual({
      statement: [{
        id: expect.any(String),
        type: "deposit",
        amount: 200.00,
        description: "Deposit test",
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }, {
        id: expect.any(String),
        type: "withdraw",
        amount: 40.00,
        description: "Withdraw test",
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }],
      balance: 160.00
    })
  })

  it("should not be able to get balance to a non-authenticated user", async() => {
    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")

    expect(responseBalance.status).toBe(401)
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})