import { WitnessConfig } from '@xyo-network/witness'

export type NodeSystemInfoWitnessConfigSchema = 'network.xyo.system.info.witness.node.config'
export const NodeSystemInfoWitnessConfigSchema: NodeSystemInfoWitnessConfigSchema = 'network.xyo.system.info.witness.node.config'

export type NodeSystemInfoWitnessConfig = WitnessConfig<{
  nodeValues?: Record<string, string>
  schema: NodeSystemInfoWitnessConfigSchema
}>
