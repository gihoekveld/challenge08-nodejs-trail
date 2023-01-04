import { makeStatement } from "../../../../test/factories/statement-factory";
import { makeUser } from "../../../../test/factories/user-factory";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to get balance", async () => {
    const user = await createUserUseCase.execute(makeUser())

    await createStatementUseCase.execute(makeStatement({
      user_id: user.id as string,
      amount: 100.00
    }))

    await createStatementUseCase.execute(makeStatement({
      user_id: user.id as string,
      amount: 140.00
    }))

    const balance = await getBalanceUseCase.execute({user_id: user.id as string})

    expect(balance.balance).toBe(240.00)
    expect(balance.statement.length).toBe(2)
  })

  it("should not be able to get balance of non-existent user", async () => {
    expect(async() => 
      await getBalanceUseCase.execute({user_id: 'non-existent-user-id'})
    ).rejects.toBeInstanceOf(GetBalanceError)
  })
})