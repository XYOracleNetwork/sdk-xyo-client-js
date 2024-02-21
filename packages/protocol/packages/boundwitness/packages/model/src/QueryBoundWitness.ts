import { Hash } from '@xylabs/hex'
import { WithMeta } from '@xyo-network/payload-model'

import { BoundWitness, BoundWitnessSchema } from './BoundWitness'
import { isBoundWitness, isBoundWitnessWithMeta } from './isBoundWitness'

export type QueryBoundWitnessSchema = BoundWitnessSchema
export const QueryBoundWitnessSchema: QueryBoundWitnessSchema = BoundWitnessSchema

export type QueryBoundWitness = BoundWitness<{
  query: Hash
  resultSet?: string
  schema: QueryBoundWitnessSchema
}>

export const isQueryBoundWitness = (x?: unknown): x is QueryBoundWitness => isBoundWitness(x) && (x as QueryBoundWitness)?.query !== undefined
export const isQueryBoundWitnessWithMeta = (x?: unknown): x is WithMeta<QueryBoundWitness> =>
  isBoundWitness(x) && isBoundWitnessWithMeta(x) && (x as WithMeta<QueryBoundWitness>)?.query !== undefined
