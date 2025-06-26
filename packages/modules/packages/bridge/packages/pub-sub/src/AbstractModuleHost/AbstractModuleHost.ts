import { Base } from '@xylabs/base'
import type { CreatableParams } from '@xylabs/creatable'
import type { Promisable } from '@xylabs/promise'
import type { ModuleInstance } from '@xyo-network/module-model'

export type ModuleHostParams<THostedInstance extends ModuleInstance = ModuleInstance> = CreatableParams<{
  mod: THostedInstance
}>

export abstract class AbstractModuleHost<TParams extends ModuleHostParams = ModuleHostParams> extends Base<TParams> {
  abstract start(): Promisable<void>
  abstract stop(): Promisable<void>
}
