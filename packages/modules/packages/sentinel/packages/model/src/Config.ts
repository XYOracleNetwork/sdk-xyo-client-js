import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { SentinelAutomationPayload } from './Automation'
import { Task } from './Task'

export type SentinelConfigSchema = 'network.xyo.sentinel.config'
export const SentinelConfigSchema: SentinelConfigSchema = 'network.xyo.sentinel.config'

export type SentinelConfig<TConfig extends Payload | void = void> = ModuleConfig<
  TConfig,
  {
    automations?: SentinelAutomationPayload[]
    synchronous?: boolean
    tasks: Task[]
    throwErrors?: boolean
  },
  TConfig extends Payload ? TConfig['schema'] : SentinelConfigSchema
>
