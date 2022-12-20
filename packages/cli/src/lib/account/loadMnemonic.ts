import { readJson } from '../file'
import { AccountFile } from './AccountFile'
import { accountFile } from './files'

export const loadMnemonic = async (): Promise<string | undefined> => {
  const existing = await readJson<AccountFile>(accountFile)
  return existing?.mnemonic
}
