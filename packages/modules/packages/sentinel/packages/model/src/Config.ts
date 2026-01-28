import type { WithAdditional } from '@xylabs/sdk-js'
import type { ModuleConfig } from '@xyo-network/module-model'
import {
  asSchema, type Payload, type Schema,
} from '@xyo-network/payload-model'

import type { SentinelAutomationPayload } from './Automation.ts'
import type { Task } from './Task.ts'

export const SentinelConfigSchema = asSchema('network.xyo.sentinel.config', true)
export type SentinelConfigSchema = typeof SentinelConfigSchema

export type SentinelConfig<TConfig extends Payload | void = void, TSchema extends Schema | void = void> = ModuleConfig<
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
