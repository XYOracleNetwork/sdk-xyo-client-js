import { Logger } from '@xyo-network/core'

import { IndirectModule } from './Module'

export interface CreatableModule<T extends IndirectModule = IndirectModule> {
  configSchema: string
  configSchemas: string[]
  defaultLogger?: Logger
  new (privateConstructorKey: string, params: T['params']): T
  create<T extends IndirectModule>(this: CreatableModule<T>, params?: T['params']): Promise<T>
  factory<T extends IndirectModule>(this: CreatableModule<T>, params?: T['params']): CreatableModuleFactory<T>
}

export type CreatableModuleFactory<T extends IndirectModule = IndirectModule> = Omit<Omit<CreatableModule<T>, 'new'>, 'create'> & {
  create<T extends IndirectModule>(this: CreatableModuleFactory<T>, params?: T['params']): Promise<T>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableModule<TModule extends IndirectModule = IndirectModule>() {
  return <U extends CreatableModule<TModule>>(constructor: U) => {
    constructor
  }
}
