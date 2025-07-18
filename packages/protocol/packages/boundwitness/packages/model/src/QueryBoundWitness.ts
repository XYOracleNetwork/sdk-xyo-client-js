import type { Hash } from '@xylabs/hex'
import type { WithStorageMeta } from '@xyo-network/payload-model'
import { isStorageMeta } from '@xyo-network/payload-model'

import type { BoundWitness } from './BoundWitness/index.ts'
import { isBoundWitness } from './isBoundWitness.ts'

export type QueryBoundWitnessFields = {
  error_hashes?: Hash[]
  query: Hash
}

export type UnsignedQueryBoundWitness = BoundWitness<QueryBoundWitnessFields>

export type QueryBoundWitness = UnsignedQueryBoundWitness

export const isQueryBoundWitness = (x?: unknown): x is QueryBoundWitness => isBoundWitness(x) && (x as QueryBoundWitness)?.query !== undefined
export const isQueryBoundWitnessWithStorageMeta = (x?: unknown): x is WithStorageMeta<QueryBoundWitness> => isQueryBoundWitness(x) && isStorageMeta(x)
