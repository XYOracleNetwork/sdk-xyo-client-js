import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import type { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import type { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import type { PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import type {
  PayloadRule, PayloadSearchCriteria, PointerPayload,
} from '@xyo-network/diviner-payload-pointer-model'
import { isBoundWitnessPointer } from '@xyo-network/diviner-payload-pointer-model'
import type { Payload, Schema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { combineRules } from './combineRules.ts'

const limit = 1

const createBoundWitnessFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): BoundWitnessDivinerQueryPayload[] => {
  const {
    addresses, order = 'desc', schemas, cursor,
  } = searchCriteria
  const query: BoundWitnessDivinerQueryPayload = {
    addresses,
    limit,
    order,
    payload_schemas: schemas,
    schema: BoundWitnessDivinerQuerySchema,
  }
  if (cursor) query.cursor = cursor
  return [query]
}

const createPayloadFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): Payload[] => {
  const { order = 'desc', schemas } = searchCriteria
  const query: PayloadDivinerQueryPayload = {
    limit, order, schema: PayloadDivinerQuerySchema, schemas,
  }
  return [query]
}

export const findPayload = async (
  archivist: ArchivistInstance,
  boundWitnessDiviner: BoundWitnessDiviner,
  payloadDiviner: PayloadDiviner,
  pointer: PointerPayload,
): Promise<Payload | undefined> => {
  const reference = pointer.reference as PayloadRule[][]
  const searchCriteria = combineRules(reference)
  const { addresses } = searchCriteria
  const findWitnessedPayload = addresses?.length
  const returnBoundWitness = isBoundWitnessPointer(pointer)
  if (returnBoundWitness || findWitnessedPayload) {
    const filter = createBoundWitnessFilterFromSearchCriteria(searchCriteria)
    const result = await boundWitnessDiviner.divine(filter)
    const bw = result?.[0] ? BoundWitnessWrapper.parse(result[0]) : undefined
    if (bw) {
      if (returnBoundWitness) return bw.payload
      const { schemas, order = 'desc' } = searchCriteria
      let payloadIndex = order === 'asc' ? 0 : bw.payloadHashes.length - 1
      if (schemas) {
        const schemaInSearchCriteria = (schema: Schema) => schemas.includes(schema)
        payloadIndex = order === 'asc' ? bw.payloadSchemas.findIndex(schemaInSearchCriteria) : bw.payloadSchemas.findLastIndex(schemaInSearchCriteria)
      }
      const hash = bw.payloadHashes[payloadIndex]
      const result = await archivist.get([hash])
      return result?.[0] ? PayloadWrapper.wrap(result?.[0]).payload : undefined
    }
  } else {
    // Find payload
    const filter = createPayloadFilterFromSearchCriteria(searchCriteria)
    const result = await payloadDiviner.divine(filter)
    return result?.[0] ? PayloadWrapper.wrap(result?.[0]).payload : undefined
  }
}
