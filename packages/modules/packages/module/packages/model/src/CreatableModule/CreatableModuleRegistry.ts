import { CreatableModuleFactory } from './CreatableModule'
import { CreatableModuleDictionary } from './CreatableModuleDictionary'
import { LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory'

export interface CreatableModuleRegistry {
  [key: string]: (CreatableModuleFactory | LabeledCreatableModuleFactory)[] | undefined
}

export const toCreatableModuleRegistry = (dict: CreatableModuleDictionary | CreatableModuleRegistry): CreatableModuleRegistry => {
  // eslint-disable-next-line unicorn/no-array-reduce
  return Object.entries(dict).reduce((registry, [schema, factory]) => {
    registry[schema] = Array.isArray(factory) ? factory : [factory]
    return registry
  }, {} as CreatableModuleRegistry)
}

export const assignCreatableModuleRegistry = (
  target: CreatableModuleRegistry = {},
  ...sources: CreatableModuleRegistry[]
): CreatableModuleRegistry => {
  sources.map((source) =>
    Object.entries(source).map(([schema, factories]) => {
      if (factories) {
        const existingFactories = target[schema]
        target[schema] = existingFactories ? (target[schema] = [...existingFactories, ...factories]) : factories
      }
    }),
  )
  return target
}
