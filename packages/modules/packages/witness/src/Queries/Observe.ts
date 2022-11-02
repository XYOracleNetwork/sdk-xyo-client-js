import { XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoWitnessObserveQuerySchema = 'network.xyo.query.witness.observe'
export const XyoWitnessObserveQuerySchema: XyoWitnessObserveQuerySchema = 'network.xyo.query.witness.observe'

export type XyoWitnessObserveQuery<T extends XyoPayload = XyoPayload> = XyoQuery<{
  payload?: Partial<T>
  schema: XyoWitnessObserveQuerySchema
}>
