import type { Creatable, CreatableInstance } from '@xylabs/creatable'
import type { Logger } from '@xylabs/logger'
import type { Schema } from '@xyo-network/payload-model'

import type { AttachableModuleInstance } from '../instance/index.ts'
import type { WithOptionalLabels } from '../Labels/index.ts'
import type { LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory.ts'

export interface CreatableModuleInstance extends CreatableInstance<AttachableModuleInstance> {}

export interface CreatableModuleFactory<T extends CreatableModuleInstance = CreatableModuleInstance>
  extends Omit<CreatableModule<T>, 'create' | 'createHandler' | 'paramsHandler'> {
  creatableModule: CreatableModule<T>
  defaultParams?: Partial<T['params']>

  create(
    this: CreatableModuleFactory<T>,
    params?: Partial<T['params']>): Promise<T>
}

export interface LabeledCreatableModule<T extends CreatableModuleInstance = CreatableModuleInstance> extends CreatableModule<T>, WithOptionalLabels {
  factory(params?: Partial<T['params']>): LabeledCreatableModuleFactory<T>
}

export interface CreatableModule<T extends CreatableModuleInstance = CreatableModuleInstance> extends Creatable<T> {
  configSchemas: Schema[]
  defaultConfigSchema: Schema
  defaultLogger?: Logger
  factory(params?: Partial<T['params']>): CreatableModuleFactory<T>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableModule<TModule extends CreatableModuleInstance = CreatableModuleInstance>() {
  return <U extends CreatableModule<TModule>>(constructor: U) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    constructor
  }
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function labeledCreatableModule<TModule extends CreatableModuleInstance = CreatableModuleInstance>() {
  return <U extends LabeledCreatableModule<TModule>>(constructor: U) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    constructor
  }
}
