import { Logger } from '@xylabs/logger'
import { AccountInstance } from '@xyo-network/account-model'

import { ModuleEventData } from '../EventsModels'
import { AttachableModuleInstance } from '../instance'
import { ModuleParams } from '../ModuleParams'
export interface CreatableModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AttachableModuleInstance<TParams['config'], TEventData> {
  params: TParams
}

export type CreatableModuleFactory<T extends CreatableModuleInstance = CreatableModuleInstance> = Omit<Omit<CreatableModule<T>, 'new'>, 'create'> & {
  create<T extends CreatableModuleInstance>(this: CreatableModuleFactory<T>, params?: T['params']): Promise<T>
}

export interface CreatableModule<T extends CreatableModuleInstance = CreatableModuleInstance> {
  configSchema: string
  configSchemas: string[]
  defaultLogger?: Logger
  new (privateConstructorKey: string, params: T['params'], account: AccountInstance): T
  _noOverride(functionName: string): void
  create<T extends CreatableModuleInstance>(this: CreatableModule<T>, params?: T['params']): Promise<T>
  factory<T extends CreatableModuleInstance>(this: CreatableModule<T>, params?: T['params']): CreatableModuleFactory<T>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableModule<TModule extends CreatableModuleInstance = CreatableModuleInstance>() {
  return <U extends CreatableModule<TModule>>(constructor: U) => {
    constructor
  }
}
