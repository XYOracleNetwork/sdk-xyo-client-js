import { WithAdditional } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module'
import { Payload, PayloadSetPayload } from '@xyo-network/payload-model'

export type XyoWitnessConfigSchema = 'network.xyo.witness.config'
export const XyoWitnessConfigSchema: XyoWitnessConfigSchema = 'network.xyo.witness.config'

export type XyoWitnessConfig<TConfig extends Payload | undefined = undefined> = ModuleConfig<
  WithAdditional<
    {
      schema: TConfig extends Payload ? TConfig['schema'] : XyoWitnessConfigSchema
      targetSet?: PayloadSetPayload
    },
    TConfig
  >
>
