import { PayloadDivinerSchema } from '@xyo-network/diviner-payload-model'

export const IndexedDbPayloadDivinerSchema = `${PayloadDivinerSchema}.indexeddb` as const
export type IndexedDbPayloadDivinerSchema = typeof IndexedDbPayloadDivinerSchema
