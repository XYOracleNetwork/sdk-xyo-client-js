import { asSchema } from '@xyo-network/payload-model'

export const PayloadDivinerSchema = asSchema('network.xyo.diviner.payload', true)
export type PayloadDivinerSchema = typeof PayloadDivinerSchema
