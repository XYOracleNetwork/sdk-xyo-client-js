import type { BaseParams, Promisable } from '@xylabs/sdk-js'
import { Base } from '@xylabs/sdk-js'
import type { ModuleInstance } from '@xyo-network/module-model'

export type ModuleHostParams<THostedInstance extends ModuleInstance = ModuleInstance> = BaseParams<{
  mod: THostedInstance
}>

export abstract class AbstractModuleHost<TParams extends ModuleHostParams = ModuleHostParams> extends Base<TParams> {
  abstract start(): Promisable<void>
  abstract stop(): Promisable<void>
}
