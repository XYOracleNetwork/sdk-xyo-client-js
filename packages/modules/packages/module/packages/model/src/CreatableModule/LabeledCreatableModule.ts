import type { WithOptionalLabels } from '../Labels/index.ts'
import type { CreatableModule, CreatableModuleInstance } from './CreatableModule.ts'
import type { LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory.ts'

export interface LabeledCreatableModule<T extends CreatableModuleInstance = CreatableModuleInstance> extends CreatableModule<T>, WithOptionalLabels {
  factory(params?: Partial<T['params']>): LabeledCreatableModuleFactory<T>
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
