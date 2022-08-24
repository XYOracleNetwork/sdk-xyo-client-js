import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoWitnessObserveQueryPayloadSchema = 'network.xyo.query.witness.observe'
export const XyoWitnessObserveQueryPayloadSchema: XyoWitnessObserveQueryPayloadSchema = 'network.xyo.query.witness.observe'

export type XyoWitnessObserveQueryPayload<T extends XyoQueryPayload = XyoQueryPayload> = XyoQueryPayload<
  {
    schema: XyoWitnessObserveQueryPayloadSchema
    payload?: Partial<T>
  },
  XyoWitnessObserveQueryPayloadSchema
>
