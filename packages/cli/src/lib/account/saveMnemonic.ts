import { writeJson } from '../file'
import { AccountFile } from './AccountFile'
import { accountFile } from './files'

export const saveMnemonic = async (mnemonic: string): Promise<void> => {
  const data: AccountFile = { mnemonic }
  await writeJson(accountFile, data)
}
