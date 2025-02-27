import { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { getNewBlock } from './getNewBlock.ts'

export const insertBlock = async (archivist: ArchivistInstance, boundWitnesses?: BoundWitness | BoundWitness[]): Promise<Payload[]> => {
  boundWitnesses = boundWitnesses ?? (await getNewBlock())
  const data = Array.isArray(boundWitnesses) ? boundWitnesses : [boundWitnesses]
  return archivist.insert(data)
}
