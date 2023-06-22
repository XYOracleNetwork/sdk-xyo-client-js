import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'

import { unitTestSigningAccount } from '../Account'
import { getArchivist } from '../Archivist'
import { getNewBlock } from './getNewBlock'

export const insertBlock = async (boundWitnesses?: BoundWitness | BoundWitness[], account?: AccountInstance): Promise<BoundWitness[]> => {
  boundWitnesses = boundWitnesses ?? (await getNewBlock())
  const archivist = await getArchivist(account ?? (await unitTestSigningAccount()))
  const data = Array.isArray(boundWitnesses) ? boundWitnesses : [boundWitnesses]
  return archivist.insert(data)
}
