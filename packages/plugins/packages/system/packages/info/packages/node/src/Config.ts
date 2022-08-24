import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoPayloadSchema } from './Schema'

export type XyoNodeSystemInfoWitnessConfigSchema = 'network.xyo.system.info.witness.node.config'
export const XyoNodeSystemInfoWitnessConfigSchema: XyoNodeSystemInfoWitnessConfigSchema = 'network.xyo.system.info.witness.node.config'

export type XyoNodeSystemInfoWitnessConfig = XyoWitnessConfig<
  XyoNodeSystemInfoPayload,
  {
    schema: XyoNodeSystemInfoWitnessConfigSchema
    nodeValues?: Record<string, string>
    targetSchema: XyoNodeSystemInfoPayloadSchema
  }
>
