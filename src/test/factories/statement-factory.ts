import { ICreateStatementDTO } from "../../modules/statements/useCases/createStatement/ICreateStatementDTO";

type Override = Partial<ICreateStatementDTO> 

export function makeStatement(override: Override = {}) {
  return { 
    user_id: 'user_id', 
    type: 'deposit' as ICreateStatementDTO['type'], 
    amount: 100.00, 
    description: 'statement description',
    ...override
  }
}