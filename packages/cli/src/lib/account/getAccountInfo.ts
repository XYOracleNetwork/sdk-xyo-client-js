import { accountFile } from './files'
import { getAccount } from './getAccount'

export interface AccountInfo {
  accountFile: string
  address: string
}

export const getAccountInfo = async (): Promise<AccountInfo> => {
  const account = await getAccount()
  const address = account.addressValue.hex
  return {
    accountFile,
    address,
  }
}
