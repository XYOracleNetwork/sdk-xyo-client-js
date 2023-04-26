import { BoundWitnessDiviner, BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/boundwitness-diviner-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ArchivistWrapper, DivinerWrapper } from '@xyo-network/modules'
import { PayloadArchivist, PayloadSearchCriteria } from '@xyo-network/node-core-model'
import { PayloadDiviner, PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/payload-diviner-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

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
        const schemaInSearchCriteria = (schema: string) => schemas.includes(schema)
        payloadIndex =
          direction === 'asc' ? bw.payloadSchemas.findIndex(schemaInSearchCriteria) : bw.payloadSchemas.findLastIndex(schemaInSearchCriteria)
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
