import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ArchivistWrapper, DivinerWrapper } from '@xyo-network/modules'
import {
  BoundWitnessDiviner,
  BoundWitnessQueryPayload,
  BoundWitnessQuerySchema,
  PayloadArchivist,
  PayloadDiviner,
  PayloadQueryPayload,
  PayloadQuerySchema,
  PayloadSearchCriteria,
} from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

const limit = 1

declare global {
  interface Array<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
  }
}

const createBoundWitnessFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): Payload[] => {
  const { addresses, direction, schemas, timestamp } = searchCriteria
  const order = direction === 'asc' ? 'asc' : 'desc'
  const query: BoundWitnessQueryPayload = { addresses, limit, order, payload_schemas: schemas, schema: BoundWitnessQuerySchema, timestamp }
  return [query]
}

const createPayloadFilterFromSearchCriteria = (searchCriteria: PayloadSearchCriteria): Payload[] => {
  const { direction, schemas, timestamp } = searchCriteria
  const order = direction === 'asc' ? 'asc' : 'desc'
  const query: PayloadQueryPayload = { limit, order, schema: PayloadQuerySchema, schemas, timestamp }
  return [query]
}

export const findPayload = async (
  archivist: PayloadArchivist,
  boundWitnessDiviner: BoundWitnessDiviner,
  payloadDiviner: PayloadDiviner,
  searchCriteria: PayloadSearchCriteria,
): Promise<Payload | undefined> => {
  let response: Payload | undefined
  // Find witnessed payload
  const { addresses } = searchCriteria
  if (addresses?.length) {
    const filter = createBoundWitnessFilterFromSearchCriteria(searchCriteria)
    const boundWitnesses = DivinerWrapper.wrap(boundWitnessDiviner)
    const result = await boundWitnesses.divine(filter)
    const bw = result?.[0] ? BoundWitnessWrapper.parse(result[0]) : undefined
    if (bw) {
      const { schemas, direction } = searchCriteria
      let payloadIndex = direction === 'asc' ? 0 : bw.payloadHashes.length - 1
      if (schemas) {
        payloadIndex =
          direction === 'asc'
            ? bw.payloadSchemas.findIndex((schema) => schemas.includes(schema))
            : bw.payloadSchemas.findLastIndex((schema) => schemas.includes(schema))
      }
      const hash = bw.payloadHashes[payloadIndex]
      const payloads = ArchivistWrapper.wrap(archivist)
      const result = await payloads.get([hash])
      response = result?.[0]
    }
  }
  // Find payload
  else {
    const filter = createPayloadFilterFromSearchCriteria(searchCriteria)
    const payloads = DivinerWrapper.wrap(payloadDiviner)
    const result = await payloads.divine(filter)
    response = result?.[0]
  }
  return response ? PayloadWrapper.parse(response).body : undefined
}
