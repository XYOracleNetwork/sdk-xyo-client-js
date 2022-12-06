import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'
export const XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'

export type XyoDomainWitnessConfig = XyoWitnessConfig<{
  domain: string
  schema: XyoDomainWitnessConfigSchema
}>
