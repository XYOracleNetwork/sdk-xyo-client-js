import { Base, BaseParams } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { ModuleInstance } from '@xyo-network/module-model'

export type ModuleHostParams<THostedInstance extends ModuleInstance = ModuleInstance> = BaseParams<{
  module: THostedInstance
}>

export abstract class AbstractModuleHost<TParams extends ModuleHostParams = ModuleHostParams> extends Base<TParams> {
  abstract start(): Promisable<void>
  abstract stop(): Promisable<void>
}
