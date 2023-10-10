import { Payload } from '@xyo-network/payload-model'

import { BoundWitness, BoundWitnessSchema } from './BoundWitness'
import { isBoundWitness } from './isBoundWitness'

export type QueryBoundWitnessSchema = BoundWitnessSchema
export const QueryBoundWitnessSchema: QueryBoundWitnessSchema = BoundWitnessSchema

export type QueryBoundWitness = BoundWitness<{
  query: string
  resultSet?: string
  schema: QueryBoundWitnessSchema
}>

export const isQueryBoundWitness = (x?: Payload | null): x is QueryBoundWitness => isBoundWitness(x) && (x as QueryBoundWitness)?.query !== undefined
