import { BoundWitnessDivinerSchema } from '@xyo-network/diviner-boundwitness-model'
import { asSchema } from '@xyo-network/payload-model'

export const IndexedDbBoundWitnessDivinerSchema = asSchema(`${BoundWitnessDivinerSchema}.indexeddb`, true)
export type IndexedDbBoundWitnessDivinerSchema = typeof IndexedDbBoundWitnessDivinerSchema
