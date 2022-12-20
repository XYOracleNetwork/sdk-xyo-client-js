import { saveSettings, Settings } from '../settings'

export const saveMnemonic = async (mnemonic: string): Promise<void> => {
  const data: Settings = { account: { mnemonic } }
  await saveSettings(data)
}
