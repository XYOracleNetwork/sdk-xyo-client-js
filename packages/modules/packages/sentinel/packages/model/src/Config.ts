import { ModuleConfig } from '@xyo-network/module-model'
import { WithAdditional } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'

import { SentinelAutomationPayload } from './Automation'
import { Task } from './Task'

export const SentinelConfigSchema = 'network.xyo.sentinel.config'
export type SentinelConfigSchema = typeof SentinelConfigSchema

export type SentinelConfig<TConfig extends Payload | void = void, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      automations?: SentinelAutomationPayload[]
      schema: TConfig extends Payload ? TConfig['schema'] : SentinelConfigSchema
      synchronous?: boolean
      tasks: Task[]
      throwErrors?: boolean
    },
    TConfig
  >,
  TSchema
>
