import { CreatableModuleFactory } from './CreatableModule'
import { WithLabels } from './Labels'

export type LabeledCreatableModuleFactory = CreatableModuleFactory & WithLabels

export const hasLabels = (factory: CreatableModuleFactory | LabeledCreatableModuleFactory): factory is LabeledCreatableModuleFactory => {
  return (factory as LabeledCreatableModuleFactory).labels !== undefined
}
