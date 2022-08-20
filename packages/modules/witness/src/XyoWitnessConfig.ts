import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoWitnessConfigSchema = 'network.xyo.witness.config'
export const XyoWitnessConfigSchema: XyoWitnessConfigSchema = 'network.xyo.witness.config'

export type XyoWitnessConfig<TTargetSchema extends string = string, TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<
  {
    targetSchema: TTargetSchema
  } & TConfig
>
