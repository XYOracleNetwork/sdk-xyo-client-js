import { ModuleConfig } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

export type DivinerConfigSchema = 'network.xyo.diviner.config'
export const DivinerConfigSchema: DivinerConfigSchema = 'network.xyo.diviner.config'

export type DivinerConfig<TConfig extends Payload | undefined = undefined> = ModuleConfig<
  {
    schema: TConfig extends Payload ? TConfig['schema'] : DivinerConfigSchema
  } & Omit<TConfig, 'schema'>
>
