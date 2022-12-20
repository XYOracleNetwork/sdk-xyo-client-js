import { writeFile } from 'fs/promises'

import { accountFile } from './files'

export const saveMnemonic = (mnemonic: string): Promise<void> => {
  return writeFile(accountFile, mnemonic, { encoding: 'utf-8' })
}
