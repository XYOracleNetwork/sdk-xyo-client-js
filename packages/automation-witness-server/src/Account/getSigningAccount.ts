import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'

export const getSigningAccount = (phrase = process.env.ACCOUNT_SEED): Account => {
  const parsed = assertEx(phrase, 'ACCOUNT_SEED ENV VAR required')
  return new Account({ phrase: parsed })
}
