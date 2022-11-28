import { ArchivistWrapper } from '@xyo-network/archivist'
import { BoundWitnessesArchivist, PayloadArchivist, PayloadSearchCriteria, XyoPayloadFilterPredicate } from '@xyo-network/node-core-model'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'

const createPayloadFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): XyoPayloadFilterPredicate => {
  const { archives, direction, schemas, timestamp } = searchCriteria
  const order = direction === 'asc' ? 'asc' : 'desc'
  const query: XyoPayloadFilterPredicate = { limit: 1, order, timestamp }
  if (archives?.length) query.archives = archives
  if (schemas?.length) query.schemas = schemas
  return query
}

const isPayloadSignedByAddress = async (archivist: BoundWitnessesArchivist, hash: string, addresses: string[]): Promise<boolean> => {
  const filter = { addresses, limit: 1, payload_hashes: [hash] }

  const wrapper = new ArchivistWrapper(archivist)
  const result = await wrapper.find(filter)

  return result?.length > 0
}

export const findPayload = async (
  boundWitnessArchivist: BoundWitnessesArchivist,
  payloadArchivist: PayloadArchivist,
  searchCriteria: PayloadSearchCriteria,
): Promise<XyoPayload | undefined> => {
  const { addresses } = searchCriteria
  const filter = createPayloadFilterFromSearchCriteria(searchCriteria)
  const wrapper = new ArchivistWrapper(payloadArchivist)

  const result = await wrapper.find(filter)

  const payload = result?.[0] ?? undefined
  if (payload && addresses.length) {
    const hash = new PayloadWrapper(payload).hash
    const signed = await isPayloadSignedByAddress(boundWitnessArchivist, hash, addresses)
    return signed ? payload : undefined
  } else {
    return payload
  }
}
