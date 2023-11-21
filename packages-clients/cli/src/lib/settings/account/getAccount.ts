import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { generateMnemonic } from 'bip39'

import { loadMnemonic } from './loadMnemonic'
import { saveMnemonic } from './saveMnemonic'

export const getAccount = async (): Promise<AccountInstance> => {
  let mnemonic = await loadMnemonic()
  if (!mnemonic) {
    mnemonic = generateMnemonic()
    await saveMnemonic(mnemonic)
  }
  const account = Account.fromPhrase(mnemonic)
  return account
}
