import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account/index.js'
import { getNewBlock } from './getNewBlock.js'

export const insertBlock = async (boundWitnesses?: BoundWitness | BoundWitness[], account?: AccountInstance): Promise<WithMeta<Payload>[]> => {
  boundWitnesses = boundWitnesses ?? (await getNewBlock())
  const archivist = await getArchivistByName('XYOPublic:Archivist', account ?? (await unitTestSigningAccount()))
  const data = Array.isArray(boundWitnesses) ? boundWitnesses : [boundWitnesses]
  return archivist.insert(data)
}
