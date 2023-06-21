import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'

export const getAccount = async (path?: string): Promise<Account> => {
  const mnemonic = assertEx(process.env.MNEMONIC, 'Missing mnemonic for wallet creation')
  return await Account.fromMnemonic(mnemonic, path)
}
