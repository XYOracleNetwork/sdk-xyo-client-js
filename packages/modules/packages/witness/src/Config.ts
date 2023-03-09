import { AnyObject } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module'
import { PayloadSetPayload } from '@xyo-network/payload-model'

export type XyoWitnessConfigSchema = 'network.xyo.witness.config'
export const XyoWitnessConfigSchema: XyoWitnessConfigSchema = 'network.xyo.witness.config'

export type XyoWitnessConfig<TConfig extends AnyObject = AnyObject> = ModuleConfig<
  {
    targetSet?: PayloadSetPayload
  } & TConfig
>
