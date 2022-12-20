import { readFile, stat } from 'fs/promises'

import { accountFile } from './files'

export const loadMnemonic = async (): Promise<string | undefined> => {
  try {
    if ((await stat(accountFile)).isFile()) {
      const mnemonic = await readFile(accountFile, { encoding: 'utf-8' })
      if (mnemonic) return mnemonic
    }
  } catch (_error) {
    // File doesn't exist or is corrupt
  }
  return undefined
}
