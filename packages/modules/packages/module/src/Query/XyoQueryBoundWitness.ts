import { XyoBoundWitness } from '@xyo-network/boundwitness'

export type XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness.query'
export const XyoQueryBoundWitnessSchema: XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness.query'

export type XyoQueryBoundWitness = XyoBoundWitness<{ schema: XyoQueryBoundWitnessSchema; query: string }>
