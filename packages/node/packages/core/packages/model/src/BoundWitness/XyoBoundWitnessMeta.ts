import { XyoPayloadMeta, XyoPayloadWithPartialMeta } from '../Payload'

export type XyoBoundWitnessMetaBase<P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = XyoPayloadMeta<{
  _payloads?: P[]
  _source_ip?: string
  _user_agent?: string
}>
