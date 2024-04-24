import { Schema } from '@xyo-network/payload-model'

import { AttachableModuleInstance } from '../instance'
import { Labels } from '../Labels'
import { CreatableModuleFactory } from './CreatableModule'
import { LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory'

export interface CreatableModuleRegistry {
  [key: Schema]: (CreatableModuleFactory | LabeledCreatableModuleFactory)[] | undefined
}

const buildModuleFactory = <TModule extends AttachableModuleInstance>(
  mod: CreatableModuleFactory<TModule>,
  labels?: Labels,
): LabeledCreatableModuleFactory<TModule> => {
  const factory: LabeledCreatableModuleFactory<TModule> = {
    // Destructure instance properties
    ...mod,

    configSchemas: mod.configSchemas,
    // Copy static methods
    create: mod.create.bind(mod) as LabeledCreatableModuleFactory<TModule>['create'],

    defaultConfigSchema: mod.defaultConfigSchema,
    // Merge module & supplied labels
    labels: { ...(mod as LabeledCreatableModuleFactory).labels, ...labels },
  }
  return factory
}

export const registerCreatableModuleFactory = <TModule extends AttachableModuleInstance>(
  registry: CreatableModuleRegistry,
  factory: CreatableModuleFactory<TModule> | LabeledCreatableModuleFactory<TModule>,
  labels?: Labels,
) => {
  const factoryClone: LabeledCreatableModuleFactory<TModule> = buildModuleFactory(factory, labels)
  //add the defaultConfigSchema as the first key in the registry
  registry[factory.defaultConfigSchema] = [factoryClone, ...(registry[factoryClone.defaultConfigSchema] ?? [])]
  for (const schema of factoryClone.configSchemas) {
    registry[schema] = [...(registry[schema] ?? []), factoryClone]
  }
}

export const registerPrimaryCreatableModuleFactory = (
  registry: CreatableModuleRegistry,
  factory: CreatableModuleFactory | LabeledCreatableModuleFactory,
  configSchema: Schema,
  labels?: Labels,
) => {
  const factoryClone = buildModuleFactory(factory, labels)
  registry[configSchema] = [factoryClone, ...(registry[configSchema] ?? [])]
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
