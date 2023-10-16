import { PayloadMeta, PayloadWithPartialMeta } from '../Payload'

/** @deprecated This type will be moved to mongodb specific package soon */
export type BoundWitnessMetaBase<P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = PayloadMeta<{
  _payloads?: P[]
  _source_ip?: string
  _user_agent?: string
}>
