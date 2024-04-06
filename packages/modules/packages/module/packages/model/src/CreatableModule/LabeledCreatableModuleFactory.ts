import { WithOptionalLabels } from '../Labels'
import { CreatableModuleFactory, CreatableModuleInstance } from './CreatableModule'

export type LabeledCreatableModuleFactory<T extends CreatableModuleInstance = CreatableModuleInstance> = CreatableModuleFactory<T> &
  WithOptionalLabels

export const hasLabels = (factory: CreatableModuleFactory | LabeledCreatableModuleFactory): factory is LabeledCreatableModuleFactory => {
  return (factory as LabeledCreatableModuleFactory).labels !== undefined
}
