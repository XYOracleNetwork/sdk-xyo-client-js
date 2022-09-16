/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { XyoPayloadMeta, XyoPayloadWithPartialMeta } from '@xyo-network/payload'

/** @deprecated - meta fields not supported by client anymore */
export type XyoBoundWitnessMetaBase<P extends XyoPayloadWithPartialMeta = XyoPayloadWithPartialMeta> = XyoPayloadMeta<{
  _payloads?: P[]
  _source_ip?: string
  _user_agent?: string
}>
