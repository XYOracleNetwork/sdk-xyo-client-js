import { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { getNewBlock } from './getNewBlock.js'

export const insertBlock = async (archivist: ArchivistInstance, boundWitnesses?: BoundWitness | BoundWitness[]): Promise<WithMeta<Payload>[]> => {
  boundWitnesses = boundWitnesses ?? (await getNewBlock())
  const data = Array.isArray(boundWitnesses) ? boundWitnesses : [boundWitnesses]
  return archivist.insert(data)
}
