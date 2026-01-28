import { asSchema } from '@xyo-network/payload-model'

export const ValueSchema = asSchema('network.xyo.value', true)
export type ValueSchema = typeof ValueSchema
