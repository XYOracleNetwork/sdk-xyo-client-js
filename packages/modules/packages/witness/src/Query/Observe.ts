import { XyoQueryPayload } from '@xyo-network/module'

export type XyoWitnessObserveQuerySchema = 'network.xyo.query.witness.observe'
export const XyoWitnessObserveQuerySchema: XyoWitnessObserveQuerySchema = 'network.xyo.query.witness.observe'

export type XyoWitnessObserveQueryPayload<T extends XyoQueryPayload = XyoQueryPayload> = XyoQueryPayload<{
  schema: XyoWitnessObserveQuerySchema
  payload?: Partial<T>
}>
