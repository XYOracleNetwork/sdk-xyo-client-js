import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoBowserSystemInfoPayload } from './Payload'

export type XyoBowserSystemInfoWitnessConfigSchema = 'network.xyo.system.info.witness.bowser.config'
export const XyoBowserSystemInfoWitnessConfigSchema: XyoBowserSystemInfoWitnessConfigSchema = 'network.xyo.system.info.witness.bowser.config'

export type XyoBowserSystemInfoWitnessConfig = XyoWitnessConfig<
  XyoBowserSystemInfoPayload,
  {
    schema: XyoBowserSystemInfoWitnessConfigSchema
  }
>
