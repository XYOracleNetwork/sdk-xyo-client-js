import { readFile } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'

const fileName = '.xyo.seed'

export const loadMnemonic = async (): Promise<string | undefined> => {
  const file = join(homedir(), fileName)
  const mnemonic = await readFile(file, { encoding: 'utf-8' })
  return mnemonic || undefined
}
