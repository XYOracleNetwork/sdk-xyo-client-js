import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoWitnessQueryPayload<T extends XyoPayload = XyoPayload> = XyoQueryPayload<T>
