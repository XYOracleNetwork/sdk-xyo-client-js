import { ArchivistInstance } from '@xyo-network/archivist'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { isBoundWitnessPointer, PayloadSearchCriteria, PointerPayload } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { combineRules } from './combineRules'

const limit = 1

// TODO: Remove once we upgrade to TypeScript 5.0 as this definition is included natively
// https://github.com/microsoft/TypeScript/issues/48829
declare global {
  interface Array<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
  }
}

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
  archivist: ArchivistInstance,
  boundWitnessDiviner: BoundWitnessDiviner,
  payloadDiviner: PayloadDiviner,
  pointer: PointerPayload,
): Promise<Payload | undefined> => {
  const searchCriteria = combineRules(pointer.reference)
  const { addresses } = searchCriteria
  const findWitnessedPayload = addresses?.length
  const returnBoundWitness = isBoundWitnessPointer(pointer)
  if (returnBoundWitness || findWitnessedPayload) {
    const filter = createBoundWitnessFilterFromSearchCriteria(searchCriteria)
    const result = await boundWitnessDiviner.divine(filter)
    const bw = result?.[0] ? BoundWitnessWrapper.parse(result[0]) : undefined
    if (bw) {
      if (returnBoundWitness) return bw.body()
      const { schemas, direction } = searchCriteria
      let payloadIndex = direction === 'asc' ? 0 : bw.payloadHashes.length - 1
      if (schemas) {
        const schemaInSearchCriteria = (schema: string) => schemas.includes(schema)
        payloadIndex =
          direction === 'asc' ? bw.payloadSchemas.findIndex(schemaInSearchCriteria) : bw.payloadSchemas.findLastIndex(schemaInSearchCriteria)
      }
      const hash = bw.payloadHashes[payloadIndex]
      const result = await archivist.get([hash])
      return result?.[0] ? PayloadWrapper.wrap(result?.[0]).body() : undefined
    }
  }
  // Find payload
  else {
    const filter = createPayloadFilterFromSearchCriteria(searchCriteria)
    const result = await payloadDiviner.divine(filter)
    return result?.[0] ? PayloadWrapper.wrap(result?.[0]).body() : undefined
  }
}
