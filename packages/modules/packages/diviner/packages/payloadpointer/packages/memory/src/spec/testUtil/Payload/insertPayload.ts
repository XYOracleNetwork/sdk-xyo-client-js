import { ArchivistInstance } from '@xyo-network/archivist-model'
import { Payload } from '@xyo-network/payload-model'

import { getNewPayload } from './getNewPayload.ts'

export const insertPayload = async (archivist: ArchivistInstance, payloads?: Payload | Payload[]): Promise<Payload[]> => {
  const workingPayloads = payloads ?? (await getNewPayload())
  const data = Array.isArray(workingPayloads) ? workingPayloads : [workingPayloads]
  return archivist.insert(data)
}
