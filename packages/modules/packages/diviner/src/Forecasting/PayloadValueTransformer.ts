import { XyoPayload } from '@xyo-network/payload-model'

export type PayloadValueTransformer = (payload: XyoPayload) => number | number[]
