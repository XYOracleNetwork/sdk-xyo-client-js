import { WitnessConfig } from '@xyo-network/witness'

export type XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'
export const XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'

export type XyoDomainWitnessConfig = WitnessConfig<{
  domain?: string
  schema: XyoDomainWitnessConfigSchema
}>
