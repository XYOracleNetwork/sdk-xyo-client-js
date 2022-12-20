import { loadSettings } from '../settings'

export const loadMnemonic = async (): Promise<string | undefined> => {
  const existing = await loadSettings()
  return existing?.account?.mnemonic
}
