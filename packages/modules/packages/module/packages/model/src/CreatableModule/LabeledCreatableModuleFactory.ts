import type { AttachableModuleInstance } from '../instance/index.ts'
import type { WithOptionalLabels } from '../Labels/index.ts'
import type { CreatableModuleFactory } from './CreatableModule.ts'

export type LabeledCreatableModuleFactory<T extends AttachableModuleInstance | void = void> = CreatableModuleFactory<T> & WithOptionalLabels

export const hasLabels = (factory: CreatableModuleFactory | LabeledCreatableModuleFactory): factory is LabeledCreatableModuleFactory => {
  return (factory as LabeledCreatableModuleFactory).labels !== undefined
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous labeled creation factory pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function labeledCreatableModuleFactory<TModule extends AttachableModuleInstance = AttachableModuleInstance>() {
  return <U extends LabeledCreatableModuleFactory<TModule>>(constructor: U) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    constructor
  }
}
