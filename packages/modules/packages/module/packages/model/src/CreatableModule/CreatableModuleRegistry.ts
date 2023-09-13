import { CreatableModuleFactory } from './CreatableModule'
import { CreatableModuleDictionary } from './CreatableModuleDictionary'
import { LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory'

export interface CreatableModuleRegistry {
  [key: string]: (CreatableModuleFactory | LabeledCreatableModuleFactory)[] | undefined
}

export const toCreatableModuleRegistry = (dict: CreatableModuleDictionary): CreatableModuleRegistry => {
  return Object.entries(dict).reduce((registry, [schema, factory]) => {
    registry[schema] = [factory]
    return registry
  }, {} as CreatableModuleRegistry)
}
