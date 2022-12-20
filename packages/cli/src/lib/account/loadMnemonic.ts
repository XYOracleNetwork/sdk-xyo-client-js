import { readFile, stat } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'

const fileName = '.xyo.seed'

export const loadMnemonic = async (): Promise<string | undefined> => {
  const file = join(homedir(), fileName)
  try {
    if ((await stat(file)).isFile()) {
      const mnemonic = await readFile(file, { encoding: 'utf-8' })
      if (mnemonic) return mnemonic
    }
  } catch (_error) {
    // File doesn't exist or is corrupt
  }
  return undefined
}
