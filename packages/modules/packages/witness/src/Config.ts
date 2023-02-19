import { ModuleConfig } from '@xyo-network/module'
import { PayloadSetPayload, XyoPayload } from '@xyo-network/payload-model'

export type XyoWitnessConfigSchema = 'network.xyo.witness.config'
export const XyoWitnessConfigSchema: XyoWitnessConfigSchema = 'network.xyo.witness.config'

export type XyoWitnessConfig<TConfig extends XyoPayload = XyoPayload> = ModuleConfig<
  TConfig & {
    targetSet?: PayloadSetPayload
  }
>
