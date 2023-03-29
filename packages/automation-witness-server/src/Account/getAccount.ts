import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'

export const getAccount = (path?: string): Account => {
  const mnemonic = assertEx(process.env.MNEMONIC, 'Missing mnemonic for wallet creation')
  return Account.fromMnemonic(mnemonic, path)
}
