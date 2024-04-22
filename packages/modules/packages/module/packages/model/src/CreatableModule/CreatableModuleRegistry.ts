import { Schema } from '@xyo-network/payload-model'

import { CreatableModuleFactory } from './CreatableModule'
import { LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory'

export interface CreatableModuleRegistry {
  [key: string]: (CreatableModuleFactory | LabeledCreatableModuleFactory)[] | undefined
}

export const registerCreatableModuleFactory = (
  registry: CreatableModuleRegistry,
  factory: CreatableModuleFactory | LabeledCreatableModuleFactory,
) => {
  //add the defaultConfigSchema as the first key in the registry
  registry[factory.defaultConfigSchema] = [factory, ...(registry[factory.defaultConfigSchema] ?? [])]
  for (const schema of factory.configSchemas) {
    registry[schema] = [...(registry[schema] ?? []), factory]
  }
}

export const registerPrimaryCreatableModuleFactory = (
  registry: CreatableModuleRegistry,
  factory: CreatableModuleFactory | LabeledCreatableModuleFactory,
  configSchema: Schema,
) => {
  registry[configSchema] = [factory, ...(registry[configSchema] ?? [])]
}

export const registerCreatableModuleFactories = (
  factories: (CreatableModuleFactory | LabeledCreatableModuleFactory)[],
  registry: CreatableModuleRegistry = {},
) => {
  for (const factory of factories) {
    registerCreatableModuleFactory(registry, factory)
  }
  return registry
}

/** @deprecated use registerCreatableModuleFactory instead */
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
