import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'

import { unitTestSigningAccount } from '../Account'
import { getArchivist } from '../Archivist'
import { getNewBlock } from './getNewBlock'

export const insertBlock = async (
  boundWitnesses: BoundWitness | BoundWitness[] = getNewBlock(),
  account: AccountInstance = unitTestSigningAccount,
): Promise<BoundWitness[]> => {
  const archivist = await getArchivist(account)
  const data = Array.isArray(boundWitnesses) ? boundWitnesses : [boundWitnesses]
  return archivist.insert(data)
}
