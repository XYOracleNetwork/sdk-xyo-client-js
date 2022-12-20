import { Account } from '@xyo-network/account'

import { loadMnemonic } from './loadMnemonic'
import { saveMnemonic } from './saveMnemonic'

export const getAccount = async (): Promise<Account> => {
  let mnemonic = loadMnemonic()
  if (!mnemonic) {
    mnemonic = 'TODO: Generate'
    await saveMnemonic(mnemonic)
  }
  return new Account({ phrase: mnemonic })
}
