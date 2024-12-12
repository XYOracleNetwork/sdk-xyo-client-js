import type { Address, Hash } from '@xylabs/hex'
import { isStorageMeta, type WithStorageMeta } from '@xyo-network/payload-model'

import type { BoundWitness } from './BoundWitness/index.ts'
import { BoundWitnessSchema } from './BoundWitness/index.ts'
import { isBoundWitness } from './isBoundWitness.ts'

export type QueryBoundWitnessSchema = BoundWitnessSchema
export const QueryBoundWitnessSchema: QueryBoundWitnessSchema = BoundWitnessSchema

export type UnsignedQueryBoundWitness = BoundWitness<{
  // address that initiated the query
  $destination?: Address
  // address for which the query is intended
  $source?: Address
  additional?: Hash[]
  error_hashes?: Hash[]
  query: Hash
  resultSet?: string
  schema: QueryBoundWitnessSchema
}>

export type QueryBoundWitness = UnsignedQueryBoundWitness

export const isQueryBoundWitness = (x?: unknown): x is QueryBoundWitness => isBoundWitness(x) && (x as QueryBoundWitness)?.query !== undefined
export const isQueryBoundWitnessWithStorageMeta = (x?: unknown): x is WithStorageMeta<QueryBoundWitness> => isQueryBoundWitness(x) && isStorageMeta(x)
