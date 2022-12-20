import { Account } from '@xyo-network/account'
import { generateMnemonic } from 'bip39'

import { loadMnemonic } from './loadMnemonic'
import { saveMnemonic } from './saveMnemonic'

export const getAccount = async (): Promise<Account> => {
  let mnemonic = await loadMnemonic()
  if (!mnemonic) {
    mnemonic = generateMnemonic()
    await saveMnemonic(mnemonic)
  }
  return Account.fromMnemonic(mnemonic)
}
