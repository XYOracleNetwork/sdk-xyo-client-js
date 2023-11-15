import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { Task } from './Task'

export type SentinelConfigSchema = 'network.xyo.sentinel.config'
export const SentinelConfigSchema: SentinelConfigSchema = 'network.xyo.sentinel.config'

export type SentinelConfig<TConfig extends Payload | void = void> = ModuleConfig<
  TConfig,
  {
    synchronous?: boolean
    tasks: Task[]
  },
  TConfig extends Payload ? TConfig['schema'] : SentinelConfigSchema
>
