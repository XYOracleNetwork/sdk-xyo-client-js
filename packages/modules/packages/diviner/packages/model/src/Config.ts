import { ModuleConfig } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

export type XyoDivinerConfigSchema = 'network.xyo.diviner.config'
export const XyoDivinerConfigSchema: XyoDivinerConfigSchema = 'network.xyo.diviner.config'

export type DivinerConfig<TConfig extends Payload | undefined = undefined> = ModuleConfig<
  {
    schema: TConfig extends Payload ? TConfig['schema'] : XyoDivinerConfigSchema
  } & Omit<TConfig, 'schema'>
>
