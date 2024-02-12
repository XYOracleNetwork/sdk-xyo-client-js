import { Payload, WithMeta } from '@xyo-network/payload-model'

import { BoundWitness, BoundWitnessSchema } from './BoundWitness'
import { isBoundWitness, isBoundWitnessWithMeta } from './isBoundWitness'

export type QueryBoundWitnessSchema = BoundWitnessSchema
export const QueryBoundWitnessSchema: QueryBoundWitnessSchema = BoundWitnessSchema

export type QueryBoundWitness = BoundWitness<{
  query: string
  resultSet?: string
  schema: QueryBoundWitnessSchema
}>

export const isQueryBoundWitness = (x?: unknown): x is QueryBoundWitness => isBoundWitness(x) && (x as QueryBoundWitness)?.query !== undefined
export const isQueryBoundWitnessWithMeta = (x?: unknown): x is WithMeta<QueryBoundWitness> =>
  isBoundWitnessWithMeta(x) && (x as WithMeta<QueryBoundWitness>)?.query !== undefined
