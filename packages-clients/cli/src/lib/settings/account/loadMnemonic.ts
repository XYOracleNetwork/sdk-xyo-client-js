import { loadSettings } from '../loadSettings'

export const loadMnemonic = async (): Promise<string | undefined> => {
  const existing = await loadSettings()
  return existing?.account?.mnemonic
}
