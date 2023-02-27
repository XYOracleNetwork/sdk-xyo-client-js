import { XyoBoundWitness } from '@xyo-network/boundwitness-model'

export type XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness'
export const XyoQueryBoundWitnessSchema: XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness'

export type XyoQueryBoundWitness = XyoBoundWitness<{
  query: string
  resultSet?: string
  schema: XyoQueryBoundWitnessSchema
}>
