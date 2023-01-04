import { ICreateUserDTO } from "../../modules/users/useCases/createUser/ICreateUserDTO";

type Override = Partial<ICreateUserDTO>

export function makeUser(override: Override = {}) {
  return {
    name: "User Test",
    email: "user@test.com",
    password: "PasswordTest1234",
    ...override
  }
}