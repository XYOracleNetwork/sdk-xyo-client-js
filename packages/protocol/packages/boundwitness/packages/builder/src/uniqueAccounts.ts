import type { AccountInstance } from '@xyo-network/account-model'

import { uniqueAddresses } from './uniqueAddresses.ts'

export const uniqueAccounts = (accounts: AccountInstance[], throwOnFalse = false) => {
  return uniqueAddresses(accounts.map(account => account.address), throwOnFalse)
}
