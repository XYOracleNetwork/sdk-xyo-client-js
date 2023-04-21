import { XyoPayload } from '@xyo-network/payload-model'

export type PayloadValueTransformer = (payload: XyoPayload) => number

export type PayloadValuesTransformer = (payload: XyoPayload) => number[]
