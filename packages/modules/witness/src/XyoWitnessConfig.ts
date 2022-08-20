import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoWitnessConfig<TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<
  {
    targetSchema: string
  } & TConfig
>
