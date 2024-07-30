import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'

let _unitTestSigningAccount: Promise<AccountInstance> | undefined
let _otherUnitTestSigningAccount: Promise<AccountInstance> | undefined

export const unitTestSigningAccount = () =>
  (_unitTestSigningAccount =
    _unitTestSigningAccount ?? Account.create({ phrase: 'draw seven setup planet bitter return old bronze neither nephew panel pelican' }))
export const otherUnitTestSigningAccount = () =>
  (_otherUnitTestSigningAccount =
    _otherUnitTestSigningAccount ?? Account.create({ phrase: 'pitch rich dentist meadow few club place dirt push sustain innocent fix' }))
