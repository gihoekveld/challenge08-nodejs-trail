import { makeUser } from "../../../../test/factories/user-factory"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let authenticateUserUseCase: AuthenticateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to authenticate an user", async () => {
    await createUserUseCase.execute(makeUser({
      email: "user_authenticated@test.com",
      password: "PasswordTest1234"
    }))

    const result = await authenticateUserUseCase.execute({
      email: "user_authenticated@test.com",
      password: "PasswordTest1234"
    })

    expect(result).toHaveProperty("token")
  })

  it("should not be able to authenticate an nonexistent user", async () => {
    expect(async() =>
      await authenticateUserUseCase.execute({
        email: "non_existing@test.com",
        password: "PasswordTest1234"
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate with incorrect password", async () => {
    expect(async() => {
      await createUserUseCase.execute(makeUser({
        email: "user@test.com",
        password: "PasswordTest1234"
      }))

      await authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "IncorrectPassword"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})