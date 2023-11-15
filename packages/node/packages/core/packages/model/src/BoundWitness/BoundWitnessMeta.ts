/* eslint-disable import/no-deprecated */
import { PayloadMeta, PayloadWithPartialMeta } from '../Payload'

/** @deprecated Use from @xyo-network/payload-mongodb [Only for Mongo] */
export type BoundWitnessMetaBase<P extends PayloadWithPartialMeta = PayloadWithPartialMeta> = PayloadMeta<{
  _payloads?: P[]
  _source_ip?: string
  _user_agent?: string
}>
