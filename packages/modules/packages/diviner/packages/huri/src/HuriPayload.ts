import { asSchema, type Payload } from '@xyo-network/payload-model'

export const HuriSchema = asSchema('network.xyo.huri', true)
export type HuriSchema = typeof HuriSchema

export type HuriPayload = Payload<{
  huri: string[]
  tokens?: string[]
}, HuriSchema>
