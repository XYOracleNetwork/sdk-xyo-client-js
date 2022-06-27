import { XyoPayloadMeta, XyoPayloadWithPartialMeta } from '@xyo-network/payload'

export type XyoBoundWitnessMeta<P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = XyoPayloadMeta<{
  _payloads?: P[]
  _signatures?: string[]
  _source_ip?: string
  _user_agent?: string
}>
