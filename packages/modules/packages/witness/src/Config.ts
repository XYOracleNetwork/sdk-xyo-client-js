import { XyoModuleConfig } from '@xyo-network/module'
import { PayloadSetPayload, XyoPayload } from '@xyo-network/payload'

export type XyoWitnessConfigSchema = 'network.xyo.witness.config'
export const XyoWitnessConfigSchema: XyoWitnessConfigSchema = 'network.xyo.witness.config'

export type XyoWitnessConfig<TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<
  TConfig & {
    targetSet?: PayloadSetPayload
  }
>
