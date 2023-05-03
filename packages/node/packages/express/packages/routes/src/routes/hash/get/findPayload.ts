import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { ArchivistWrapper, DivinerWrapper } from '@xyo-network/modules'
import { isBoundWitnessPointer, PayloadArchivist, PayloadSearchCriteria, PointerPayload } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { combineRules } from './combineRules'

const limit = 1

const createBoundWitnessFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): Payload[] => {
  const { addresses, direction, schemas, timestamp } = searchCriteria
  const order = direction === 'asc' ? 'asc' : 'desc'
  const query: BoundWitnessDivinerQueryPayload = {
    addresses,
    limit,
    order,
    payload_schemas: schemas,
    schema: BoundWitnessDivinerQuerySchema,
    timestamp,
  }
  return [query]
}

const createPayloadFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): Payload[] => {
  const { direction, schemas, timestamp } = searchCriteria
  const order = direction === 'asc' ? 'asc' : 'desc'
  const query: PayloadDivinerQueryPayload = { limit, order, schema: PayloadDivinerQuerySchema, schemas, timestamp }
  return [query]
}

export const findPayload = async (
  archivist: PayloadArchivist,
  boundWitnessDiviner: BoundWitnessDiviner,
  payloadDiviner: PayloadDiviner,
  pointer: PointerPayload,
): Promise<Payload | undefined> => {
  const searchCriteria = combineRules(pointer.reference)
  const { addresses } = searchCriteria
  const findWitnessedPayload = addresses?.length
  const findBoundWitness = isBoundWitnessPointer(pointer) || addresses?.length
  if (findBoundWitness || findWitnessedPayload) {
    const filter = createBoundWitnessFilterFromSearchCriteria(searchCriteria)
    const boundWitnesses = DivinerWrapper.wrap(boundWitnessDiviner)
    const result = await boundWitnesses.divine(filter)
    const bw = result?.[0] ? BoundWitnessWrapper.parse(result[0]) : undefined
    if (bw) {
      if (findBoundWitness) return BoundWitnessWrapper.parse(bw).boundwitness
      const { schemas, direction } = searchCriteria
      let payloadIndex = direction === 'asc' ? 0 : bw.payloadHashes.length - 1
      if (schemas) {
        const schemaInSearchCriteria = (schema: string) => schemas.includes(schema)
        payloadIndex =
          direction === 'asc' ? bw.payloadSchemas.findIndex(schemaInSearchCriteria) : bw.payloadSchemas.findLastIndex(schemaInSearchCriteria)
      }
      const hash = bw.payloadHashes[payloadIndex]
      const payloads = ArchivistWrapper.wrap(archivist)
      const result = await payloads.get([hash])
      return result?.[0] ? PayloadWrapper.parse(result?.[0]).body : undefined
    }
  }
  // Find payload
  else {
    const filter = createPayloadFilterFromSearchCriteria(searchCriteria)
    const payloads = DivinerWrapper.wrap(payloadDiviner)
    const result = await payloads.divine(filter)
    return result?.[0] ? PayloadWrapper.parse(result?.[0]).body : undefined
  }
}
