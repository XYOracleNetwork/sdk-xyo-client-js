import { BoundWitness } from '@xyo-network/boundwitness-model'

export type XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness'
export const XyoQueryBoundWitnessSchema: XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness'

export type XyoQueryBoundWitness = BoundWitness<{
  query: string
  resultSet?: string
  schema: XyoQueryBoundWitnessSchema
}>
