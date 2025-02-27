import { Payload } from '@xyo-network/payload-model'

export type PayloadValueTransformer = (payload: Payload) => number
