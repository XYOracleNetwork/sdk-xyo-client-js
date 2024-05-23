import { BoundWitnessDivinerSchema } from '@xyo-network/diviner-boundwitness-model'

export const IndexedDbBoundWitnessDivinerSchema = `${BoundWitnessDivinerSchema}.indexeddb` as const
export type IndexedDbBoundWitnessDivinerSchema = typeof IndexedDbBoundWitnessDivinerSchema
