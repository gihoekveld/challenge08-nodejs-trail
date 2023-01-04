import { makeUser } from "../../../../test/factories/user-factory"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let showUserProfileUseCase: ShowUserProfileUseCase
let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to show user profile", async () => {
    const user = await createUserUseCase.execute(makeUser())

    const profile = await showUserProfileUseCase.execute(user.id as string)

    expect(profile).toHaveProperty("id")
    expect(profile).toEqual(user)
  })

  it("should not be able to show profile of a non existing user", async () => {
    expect(async() => 
      await showUserProfileUseCase.execute("non-existing-user-id")
    ).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})