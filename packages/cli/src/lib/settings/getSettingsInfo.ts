import { getAccount } from './account'
import { settingsFile } from './files'

export interface SettingsInfo {
  account: {
    address: string
  }
  settingsFile: string
}

export const getSettingsInfo = async (): Promise<SettingsInfo> => {
  const account = await getAccount()
  const address = `0x${account.addressValue.hex}`
  return { account: { address }, settingsFile }
}
