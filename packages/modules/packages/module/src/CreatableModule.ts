import { Logger } from '@xyo-network/core'
import { Module } from '@xyo-network/module-model'

export interface CreatableModule<T extends Module = Module> {
  configSchema: string
  defaultLogger?: Logger
  new (params: T['params']): T
  create<T extends Module>(this: CreatableModule<T>, params?: T['params']): Promise<T>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableModule() {
  return <U extends CreatableModule>(constructor: U) => {
    constructor
  }
}
