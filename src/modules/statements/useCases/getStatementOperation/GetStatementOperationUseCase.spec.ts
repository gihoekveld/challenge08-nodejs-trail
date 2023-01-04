import { makeStatement } from "../../../../test/factories/statement-factory";
import { makeUser } from "../../../../test/factories/user-factory";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to get statement operation", async () => {
    const user = await createUserUseCase.execute(makeUser())

    const statement = await createStatementUseCase.execute(
      makeStatement(user.id as string, {
        amount: 150.00,
        type: 'deposit' as ICreateStatementDTO['type'],
        description: 'Salary' 
      })
    )

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    })

    expect(statementOperation).toHaveProperty('id')
    expect(statementOperation.user_id).toEqual(user.id)
    expect(statementOperation.amount).toEqual(150.00)
    expect(statementOperation.type).toEqual('deposit')
    expect(statementOperation.description).toEqual('Salary')
  })

  it("should not be able to get statement operation of non-existent user", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: 'non-existent-user-id',
        statement_id: 'non-existent-statement-id'
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get statement operation of non-existent statement", async () => {
    const user = await createUserUseCase.execute(makeUser())

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: 'non-existent-statement-id'
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})