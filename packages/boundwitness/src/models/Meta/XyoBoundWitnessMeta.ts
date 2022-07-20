import { XyoPayloadMeta, XyoPayloadWithPartialMeta } from '@xyo-network/payload'

export type XyoBoundWitnessMetaBase<P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = XyoPayloadMeta<{
  _payloads?: P[]
  _signatures?: string[]
  _source_ip?: string
  _user_agent?: string
}>
