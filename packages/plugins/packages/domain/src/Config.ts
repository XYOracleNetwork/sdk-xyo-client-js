import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoDomainPayload } from './Payload'

export type XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'
export const XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'

export type XyoDomainWitnessConfig = XyoWitnessConfig<
  XyoDomainPayload,
  {
    schema: XyoDomainWitnessConfigSchema
    domain: string
  }
>
