import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'

let _unitTestSigningAccount: Promise<AccountInstance> | undefined = undefined
let _otherUnitTestSigningAccount: Promise<AccountInstance> | undefined = undefined

export const unitTestSigningAccount = () => (_unitTestSigningAccount = _unitTestSigningAccount ?? Account.create({ phrase: 'test' }))
export const otherUnitTestSigningAccount = () => (_otherUnitTestSigningAccount = _otherUnitTestSigningAccount ?? Account.create({ phrase: 'other' }))
