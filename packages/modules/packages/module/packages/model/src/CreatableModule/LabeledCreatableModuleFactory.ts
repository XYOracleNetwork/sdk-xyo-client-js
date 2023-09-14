import { ModuleInstance } from '../instance'
import { WithOptionalLabels } from '../Labels'
import { CreatableModuleFactory } from './CreatableModule'

export type LabeledCreatableModuleFactory<T extends ModuleInstance = ModuleInstance> = CreatableModuleFactory<T> & WithOptionalLabels

export const hasLabels = (factory: CreatableModuleFactory | LabeledCreatableModuleFactory): factory is LabeledCreatableModuleFactory => {
  return (factory as LabeledCreatableModuleFactory).labels !== undefined
}
