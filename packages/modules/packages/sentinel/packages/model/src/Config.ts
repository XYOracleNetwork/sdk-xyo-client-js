import type { WithAdditional } from '@xylabs/object'
import type { ModuleConfig } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

import type { SentinelAutomationPayload } from './Automation.ts'
import type { Task } from './Task.ts'

export const SentinelConfigSchema = 'network.xyo.sentinel.config' as const
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
