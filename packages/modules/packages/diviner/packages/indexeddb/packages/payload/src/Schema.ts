import { PayloadDivinerSchema } from '@xyo-network/diviner-payload-model'
import { asSchema } from '@xyo-network/payload-model'

export const IndexedDbPayloadDivinerSchema = asSchema(`${PayloadDivinerSchema}.indexeddb`, true)
export type IndexedDbPayloadDivinerSchema = typeof IndexedDbPayloadDivinerSchema
