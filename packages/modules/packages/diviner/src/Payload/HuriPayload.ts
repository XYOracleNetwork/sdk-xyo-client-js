import { Payload } from '@xyo-network/payload-model'

export type HuriSchema = 'network.xyo.huri'
export const HuriSchema: HuriSchema = 'network.xyo.huri'

export type HuriPayload = Payload<{
  huri: string[]
  schema: 'network.xyo.huri'
  tokens?: string[]
}>
