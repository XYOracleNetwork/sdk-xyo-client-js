import { WithAdditional } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module'
import { Payload, PayloadSetPayload } from '@xyo-network/payload-model'

export type WitnessConfigSchema = 'network.xyo.witness.config'
export const WitnessConfigSchema: WitnessConfigSchema = 'network.xyo.witness.config'

export type WitnessConfig<TConfig extends Payload | void = void> = ModuleConfig<
  WithAdditional<
    {
      archivist?: string
      schema: TConfig extends Payload ? TConfig['schema'] : WitnessConfigSchema
      targetSet?: PayloadSetPayload
    },
    TConfig
  >
>
