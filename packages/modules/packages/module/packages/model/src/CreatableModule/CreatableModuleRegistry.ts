import { CreatableModuleFactory } from './CreatableModule'
import { LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory'

export interface CreatableModuleRegistry {
  [key: string]: (CreatableModuleFactory | LabeledCreatableModuleFactory)[] | undefined
}
