import { WithLabels } from '../Labels'
import { CreatableModuleFactory } from './CreatableModule'

export type LabeledCreatableModuleFactory = CreatableModuleFactory & WithLabels

export const hasLabels = (factory: CreatableModuleFactory | LabeledCreatableModuleFactory): factory is LabeledCreatableModuleFactory => {
  return (factory as LabeledCreatableModuleFactory).labels !== undefined
}
