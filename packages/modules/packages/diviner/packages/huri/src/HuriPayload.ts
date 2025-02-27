import { Payload } from '@xyo-network/payload-model'

export const HuriSchema = 'network.xyo.huri' as const
export type HuriSchema = typeof HuriSchema

export type HuriPayload = Payload<{
  huri: string[]
  schema: 'network.xyo.huri'
  tokens?: string[]
}>
