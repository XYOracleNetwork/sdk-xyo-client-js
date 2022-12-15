import { Account } from '@xyo-network/account'

export const getSigningAccount = (phrase = process.env.ACCOUNT_SEED): Account => {
  return new Account({ phrase })
}
