import { makeUser } from "../../../../test/factories/user-factory";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Create User", () => {
  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to create a new user", async() => {
    const user = await createUserUseCase.execute(makeUser())
    expect(user).toHaveProperty("id")
  })

  it("should not be able to create an already exists user", () => {
    expect(async() => 
      await createUserUseCase.execute(makeUser())
    ).rejects.toBeInstanceOf(CreateUserError)
  })
})