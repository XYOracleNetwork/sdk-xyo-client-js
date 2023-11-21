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
  const address = `0x${account.address}`
  return { account: { address }, settingsFile }
}
