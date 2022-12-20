import { writeFile } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'

const fileName = '.xyo.seed'

export const saveMnemonic = async (mnemonic: string): Promise<void> => {
  const file = join(homedir(), fileName)
  await writeFile(file, mnemonic, { encoding: 'utf-8' })
}
