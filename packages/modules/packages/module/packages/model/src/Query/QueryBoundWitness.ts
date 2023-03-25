import { BoundWitness } from '@xyo-network/boundwitness-model'

export type QueryBoundWitnessSchema = 'network.xyo.boundwitness'
export const QueryBoundWitnessSchema: QueryBoundWitnessSchema = 'network.xyo.boundwitness'

export type QueryBoundWitness = BoundWitness<{
  query: string
  resultSet?: string
  schema: QueryBoundWitnessSchema
}>
