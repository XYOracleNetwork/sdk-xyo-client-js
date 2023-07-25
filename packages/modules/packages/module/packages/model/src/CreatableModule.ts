import { AccountInstance } from '@xyo-network/account-model'
import { Logger } from '@xyo-network/logger'

import { ModuleInstance } from './instance'

export interface CreatableModule<T extends ModuleInstance = ModuleInstance> {
  configSchema: string
  configSchemas: string[]
  defaultLogger?: Logger
  new (privateConstructorKey: string, params: T['params'], account: AccountInstance): T
  create<T extends ModuleInstance>(this: CreatableModule<T>, params?: T['params']): Promise<T>
  factory<T extends ModuleInstance>(this: CreatableModule<T>, params?: T['params']): CreatableModuleFactory<T>
}

export type CreatableModuleFactory<T extends ModuleInstance = ModuleInstance> = Omit<Omit<CreatableModule<T>, 'new'>, 'create'> & {
  create<T extends ModuleInstance>(this: CreatableModuleFactory<T>, params?: T['params']): Promise<T>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableModule<TModule extends ModuleInstance = ModuleInstance>() {
  return <U extends CreatableModule<TModule>>(constructor: U) => {
    constructor
  }
}
