import { makeStatement } from "../../../../test/factories/statement-factory"
import { makeUser } from "../../../../test/factories/user-factory"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { ICreateStatementDTO } from "./ICreateStatementDTO"

let createStatementUseCase: CreateStatementUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  })

  it("should be able to create a new deposit statement", async() => {
    const user = await createUserUseCase.execute(makeUser())

    const statement = await createStatementUseCase.execute(
      makeStatement(user.id as string)
    )

    expect(statement).toHaveProperty("id")
  })

  it("should not be able to create a new statement to a non-existent user", () => {
    expect(async() => 
      await createStatementUseCase.execute(
        makeStatement('non-existent-user-id')
      )
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should be able to create a new withdraw statement if the user has sufficient funds", async() => {
    const user = await createUserUseCase.execute(makeUser())

    await createStatementUseCase.execute(
      makeStatement(user.id as string, {
        amount: 100.00
      })
    )

    const statement = await createStatementUseCase.execute(
      makeStatement(user.id as string, {
        type: 'withdraw' as ICreateStatementDTO['type'],
        amount: 100.00
      })
    )

    const balance = await getBalanceUseCase.execute({user_id: user.id as string})

    expect(statement).toHaveProperty("id")
    expect(balance.balance).toBe(0.00)
  })

  it("should not be able to create a new withdraw statement if the user has insufficient funds", () => {
    expect(async() => {
      const user = await createUserUseCase.execute(makeUser())

      await createStatementUseCase.execute(
        makeStatement(user.id as string, {
          type: 'withdraw' as ICreateStatementDTO['type'],
          amount: 100.00
        })
      )
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})