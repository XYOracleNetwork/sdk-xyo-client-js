import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoWitnessConfigSchema = 'network.xyo.witness.config'
export const XyoWitnessConfigSchema: XyoWitnessConfigSchema = 'network.xyo.witness.config'

export type XyoWitnessConfig<T extends XyoPayload = XyoPayload> = XyoModuleConfig<
  {
    targetSchema: string
  } & T
>
