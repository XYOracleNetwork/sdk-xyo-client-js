import { Address } from '@xylabs/hex'
import { Logger } from '@xylabs/logger'
import { AccountInstance } from '@xyo-network/account-model'
import { Schema } from '@xyo-network/payload-model'

import { AttachableModuleInstance } from '../instance/index.ts'

export type CreatableModuleFactory<T extends AttachableModuleInstance | void = void> = Omit<
  CreatableModule<T extends AttachableModuleInstance ? T : AttachableModuleInstance>,
  'new' | 'create'
> & {
  create<T extends AttachableModuleInstance>(this: CreatableModuleFactory<T>, params?: T['params']): Promise<T>
}

export interface CreatableModule<T extends AttachableModuleInstance = AttachableModuleInstance> {
  configSchemas: Schema[]
  defaultConfigSchema: Schema
  defaultLogger?: Logger
  new (privateConstructorKey: string, params: T['params'], account: AccountInstance, address: Address): T
  _noOverride(functionName: string): void
  create<T extends AttachableModuleInstance>(this: CreatableModule<T>, params?: T['params']): Promise<T>
  factory<T extends AttachableModuleInstance>(this: CreatableModule<T>, params?: T['params']): CreatableModuleFactory<T>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableModule<TModule extends AttachableModuleInstance = AttachableModuleInstance>() {
  return <U extends CreatableModule<TModule>>(constructor: U) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    constructor
  }
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation factory pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableModuleFactory<TModule extends AttachableModuleInstance = AttachableModuleInstance>() {
  return <U extends CreatableModuleFactory<TModule>>(constructor: U) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    constructor
  }
}
