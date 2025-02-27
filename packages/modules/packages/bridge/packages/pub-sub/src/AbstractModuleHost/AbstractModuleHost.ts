import type { BaseParams } from '@xylabs/object'
import { Base } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import type { ModuleInstance } from '@xyo-network/module-model'

export type ModuleHostParams<THostedInstance extends ModuleInstance = ModuleInstance> = BaseParams<{
  mod: THostedInstance
}>

export abstract class AbstractModuleHost<TParams extends ModuleHostParams = ModuleHostParams> extends Base<TParams> {
  abstract start(): Promisable<void>
  abstract stop(): Promisable<void>
}
