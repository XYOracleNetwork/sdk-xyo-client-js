import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoNodeSystemInfoWitnessConfigSchema = 'network.xyo.system.info.witness.node.config'
export const XyoNodeSystemInfoWitnessConfigSchema: XyoNodeSystemInfoWitnessConfigSchema = 'network.xyo.system.info.witness.node.config'

export type XyoNodeSystemInfoWitnessConfig = XyoWitnessConfig<{
  nodeValues?: Record<string, string>
  schema: XyoNodeSystemInfoWitnessConfigSchema
}>
