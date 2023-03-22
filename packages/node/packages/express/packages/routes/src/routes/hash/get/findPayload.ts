import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { ArchivistModule } from '@xyo-network/modules'
import { BoundWitnessesArchivist, PayloadFilterPredicate, PayloadSearchCriteria } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

const createPayloadFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): PayloadFilterPredicate => {
  const { direction, schemas, timestamp } = searchCriteria
  const order = direction === 'asc' ? 'asc' : 'desc'
  const query: PayloadFilterPredicate = { limit: 1, order, timestamp }
  if (schemas?.length) query.schemas = schemas
  return query
}

const isPayloadSignedByAddress = async (archivist: BoundWitnessesArchivist, hash: string, addresses: string[]): Promise<boolean> => {
  const filter = { addresses, limit: 1, payload_hashes: [hash] }
  const wrapper = ArchivistWrapper.wrap(archivist)
  const result = await wrapper.find(filter)
  return result?.length > 0
}

export const findPayload = async (
  boundWitnessArchivist: BoundWitnessesArchivist,
  payloadArchivist: ArchivistModule,
  searchCriteria: PayloadSearchCriteria,
): Promise<Payload | undefined> => {
  const { addresses } = searchCriteria
  const filter = createPayloadFilterFromSearchCriteria(searchCriteria)
  const wrapper = ArchivistWrapper.wrap(payloadArchivist)
  const result = await wrapper.find(filter)
  const payload = result?.[0] ? PayloadWrapper.parse(result[0]) : undefined
  if (payload && addresses.length) {
    const hash = payload.hash
    const signed = await isPayloadSignedByAddress(boundWitnessArchivist, hash, addresses)
    if (!signed) return undefined
  }
  return payload?.body
}
