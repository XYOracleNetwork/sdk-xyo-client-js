import { Account } from '@xyo-network/account'
import { generateMnemonic } from 'bip39'

import { printLine } from '../../print'
import { loadMnemonic } from './loadMnemonic'
import { saveMnemonic } from './saveMnemonic'

export const getAccount = async (): Promise<Account> => {
  printLine('Account: Loading')
  let mnemonic = await loadMnemonic()
  if (!mnemonic) {
    printLine('Account: Creating')
    mnemonic = generateMnemonic()
    printLine('Account: Created')
    await saveMnemonic(mnemonic)
  }
  const account = Account.fromMnemonic(mnemonic)
  printLine('Account: Loaded')
  return account
}
