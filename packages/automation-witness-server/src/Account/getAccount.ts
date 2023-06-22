import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'

export const getAccount = async (path?: string): Promise<AccountInstance> => {
  const mnemonic = assertEx(process.env.MNEMONIC, 'Missing mnemonic for wallet creation')
  return await Account.fromMnemonic(mnemonic, path)
}
