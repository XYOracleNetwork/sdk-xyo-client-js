import { BoundWitness, BoundWitnessFields, BoundWitnessSchema, isBoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

export type QueryBoundWitnessSchema = BoundWitnessSchema
export const QueryBoundWitnessSchema: QueryBoundWitnessSchema = BoundWitnessSchema

export interface QueryBoundWitnessFields extends BoundWitnessFields {
  query: string
  resultSet?: string
  schema: BoundWitnessSchema
}

export type QueryBoundWitness<T extends Payload | void = void> = Payload<
  T extends BoundWitness ? QueryBoundWitnessFields & T : QueryBoundWitnessFields
>

export const isQueryBoundWitness = (x?: Payload | null): x is QueryBoundWitness => isBoundWitness(x) && (x as QueryBoundWitness)?.query !== undefined
