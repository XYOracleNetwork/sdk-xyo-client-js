import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'

import { fromMnemonic } from './HdWallet'

export const getAccount = (path?: string): Account => {
  const mnemonic = assertEx(process.env.MNEMONIC, 'Missing mnemonic for wallet creation')
  return fromMnemonic(mnemonic, path)
}
