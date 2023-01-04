import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get statement operation", async() => {
    const responseAuth = await request(app)
      .post("/api/v1/sessions")
      .send({
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
  
    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      })

    const { id: statementId } = responseBalance.body.statement[0]

    const responseStatementOperation = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`
      })
    
    expect(responseStatementOperation.status).toBe(200)
    expect(responseStatementOperation.body).toEqual({
      id: expect.any(String),
      user_id: expect.any(String),
      type: "deposit",
      amount: "200.00",
      description: "Deposit test",
      created_at: expect.any(String),
      updated_at: expect.any(String)
    })
  })

  it("should not be able to get statement operation from a non-existent user", async() => {
    const nonExistentStatementId = uuidV4()
    const responseBalance = await request(app)
      .get(`/api/v1/statements/${nonExistentStatementId}`)

    expect(responseBalance.status).toBe(401)
  })

  it("should not be able to get statement operation from a non-existent operation", async() => {
    const responseAuth = await request(app)
      .post("/api/v1/sessions")
      .send({
      email: "test@fin_api.com.br",
      password: "test"
    })

    const { token } = responseAuth.body

    const nonExistentStatementId = uuidV4()

    const responseStatementOperation = await request(app)
      .get(`/api/v1/statements/${nonExistentStatementId}`)
      .set({
        Authorization: `Bearer ${token}`
      })
    
    expect(responseStatementOperation.status).toBe(404)
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
})