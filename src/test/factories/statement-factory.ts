import { ICreateStatementDTO } from "../../modules/statements/useCases/createStatement/ICreateStatementDTO";

type Override = Partial<{
  type: ICreateStatementDTO['type']
  amount: ICreateStatementDTO['amount']
  description: ICreateStatementDTO['description']
}> 

export function makeStatement(user_id: string, override: Override = {}) {
  return { 
    user_id, 
    type: 'deposit' as ICreateStatementDTO['type'], 
    amount: 100.00, 
    description: 'statement description',
    ...override
  }
}