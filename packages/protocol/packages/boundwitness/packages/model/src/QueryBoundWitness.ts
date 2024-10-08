import type { Hash } from '@xylabs/hex'
import type { WithMeta } from '@xyo-network/payload-model'

import type { BoundWitness } from './BoundWitness/index.ts'
import { BoundWitnessSchema } from './BoundWitness/index.ts'
import { isBoundWitness, isBoundWitnessWithMeta } from './isBoundWitness.ts'

export type QueryBoundWitnessSchema = BoundWitnessSchema
export const QueryBoundWitnessSchema: QueryBoundWitnessSchema = BoundWitnessSchema

export type QueryBoundWitness = BoundWitness<{
  additional?: Hash[]
  query: Hash
  resultSet?: string
  schema: QueryBoundWitnessSchema
}>

export const isQueryBoundWitness = (x?: unknown): x is QueryBoundWitness => isBoundWitness(x) && (x as QueryBoundWitness)?.query !== undefined
export const isQueryBoundWitnessWithMeta = (x?: unknown): x is WithMeta<QueryBoundWitness> =>
  isBoundWitness(x) && isBoundWitnessWithMeta(x) && (x as WithMeta<QueryBoundWitness>)?.query !== undefined
