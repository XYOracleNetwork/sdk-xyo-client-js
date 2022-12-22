import { XyoBoundWitness } from '@xyo-network/boundwitness-model'

export type XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness.query'
export const XyoQueryBoundWitnessSchema: XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness.query'

export type XyoQueryBoundWitness = XyoBoundWitness<{
  query: string
  resultSet?: string
  schema: XyoQueryBoundWitnessSchema
}>
