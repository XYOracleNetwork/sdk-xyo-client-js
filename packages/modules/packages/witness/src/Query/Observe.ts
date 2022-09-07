import { XyoQuery } from '@xyo-network/module'

export type XyoWitnessObserveQuerySchema = 'network.xyo.query.witness.observe'
export const XyoWitnessObserveQuerySchema: XyoWitnessObserveQuerySchema = 'network.xyo.query.witness.observe'

export type XyoWitnessObserveQuery<T extends XyoQuery = XyoQuery> = XyoQuery<{
  schema: XyoWitnessObserveQuerySchema
  payload?: Partial<T>
}>
