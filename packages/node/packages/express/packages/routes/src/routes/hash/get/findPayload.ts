import { DivinerWrapper } from '@xyo-network/modules'
import {
  BoundWitnessDiviner,
  BoundWitnessQueryPayload,
  BoundWitnessQuerySchema,
  PayloadDiviner,
  PayloadQueryPayload,
  PayloadQuerySchema,
  PayloadSearchCriteria,
} from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

const limit = 1

const createPayloadFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): Payload[] => {
  const { direction, schemas, timestamp } = searchCriteria
  const order = direction === 'asc' ? 'asc' : 'desc'
  const query: PayloadQueryPayload = { limit, order, schema: PayloadQuerySchema, schemas, timestamp }
  return [query]
}

const isPayloadSignedByAddress = async (diviner: BoundWitnessDiviner, hash: string, addresses: string[]): Promise<boolean> => {
  const query: BoundWitnessQueryPayload = { addresses, limit, payload_hashes: [hash], schema: BoundWitnessQuerySchema }
  const wrapper = DivinerWrapper.wrap(diviner)
  const result = await wrapper.divine([query])
  return result?.length > 0
}

export const findPayload = async (
  boundWitnessDiviner: BoundWitnessDiviner,
  payloadDiviner: PayloadDiviner,
  searchCriteria: PayloadSearchCriteria,
): Promise<Payload | undefined> => {
  const { addresses } = searchCriteria
  const filter = createPayloadFilterFromSearchCriteria(searchCriteria)
  const wrapper = DivinerWrapper.wrap(payloadDiviner)
  const result = await wrapper.divine(filter)
  const payload = result?.[0] ? PayloadWrapper.parse(result[0]) : undefined
  if (payload && addresses.length) {
    const hash = payload.hash
    const signed = await isPayloadSignedByAddress(boundWitnessDiviner, hash, addresses)
    if (!signed) return undefined
  }
  return payload?.body
}
