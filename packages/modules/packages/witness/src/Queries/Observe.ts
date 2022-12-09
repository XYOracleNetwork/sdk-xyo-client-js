import { XyoQuery } from '@xyo-network/module'

export type XyoWitnessObserveQuerySchema = 'network.xyo.query.witness.observe'
export const XyoWitnessObserveQuerySchema: XyoWitnessObserveQuerySchema = 'network.xyo.query.witness.observe'

export type XyoWitnessObserveQuery = XyoQuery<{
  payloads?: string[]
  schema: XyoWitnessObserveQuerySchema
}>
