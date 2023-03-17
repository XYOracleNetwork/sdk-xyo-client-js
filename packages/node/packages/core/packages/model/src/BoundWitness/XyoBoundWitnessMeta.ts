import { PayloadMeta, PayloadWithPartialMeta } from '../Payload'

export type XyoBoundWitnessMetaBase<P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = PayloadMeta<{
  _payloads?: P[]
  _source_ip?: string
  _user_agent?: string
}>
