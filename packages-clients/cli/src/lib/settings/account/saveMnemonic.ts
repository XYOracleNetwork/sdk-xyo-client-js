import { saveSettings } from '../saveSettings'
import { Settings } from '../Settings'

export const saveMnemonic = async (mnemonic: string): Promise<void> => {
  const data: Settings = { account: { mnemonic } }
  await saveSettings(data)
}
