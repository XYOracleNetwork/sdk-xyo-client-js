import { ModuleConfig, WithAdditional } from '@xyo-network/module'
import { PayloadSetPayload, XyoPayload } from '@xyo-network/payload-model'

export type XyoWitnessConfigSchema = 'network.xyo.witness.config'
export const XyoWitnessConfigSchema: XyoWitnessConfigSchema = 'network.xyo.witness.config'

export type XyoWitnessConfig<TConfig extends XyoPayload | undefined = undefined> = ModuleConfig<
  WithAdditional<
    {
      schema: TConfig extends XyoPayload ? TConfig['schema'] : XyoWitnessConfigSchema
      targetSet?: PayloadSetPayload
    },
    TConfig
  >
>
