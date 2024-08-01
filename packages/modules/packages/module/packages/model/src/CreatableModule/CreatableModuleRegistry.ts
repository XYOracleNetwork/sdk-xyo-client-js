import { Schema } from '@xyo-network/payload-model'

import { AttachableModuleInstance } from '../instance/index.js'
import { Labels } from '../Labels/index.js'
import { CreatableModuleFactory } from './CreatableModule.js'
import { LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory.js'

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
  /** register this as the primary factory for every schema it supports */
  primary: boolean | Schema | Schema[] = false,
) => {
  const primarySchemas =
    primary !== true && primary ?
      Array.isArray(primary) ?
        primary
      : [primary]
    : []

  for (const primarySchema of primarySchemas) {
    if (!factory.configSchemas.includes(primarySchema)) {
      console.warn(`Primary schema ${primary} not found in factory configSchemas`)
    }
  }

  const isPrimaryForSchema = (schema: Schema) => {
    switch (typeof primary) {
      case 'boolean': {
        return primary
      }
      case 'string': {
        return schema === primary
      }
      case 'object': {
        if (Array.isArray(primary)) {
          return primary.includes(schema)
        }
      }
    }
    throw new Error(`Invalid primary value: ${primary}`)
  }

  const factoryClone: LabeledCreatableModuleFactory<TModule> = buildModuleFactory(factory, labels)
  //add the defaultConfigSchema as the first key in the registry
  registry[factory.defaultConfigSchema] = [factoryClone, ...(registry[factoryClone.defaultConfigSchema] ?? [])]
  for (const schema of factoryClone.configSchemas) {
    registry[schema] = isPrimaryForSchema(schema) ? [factoryClone, ...(registry[schema] ?? [])] : [...(registry[schema] ?? []), factoryClone]
  }
}

export const registerCreatableModuleFactories = (
  factories: (CreatableModuleFactory | LabeledCreatableModuleFactory)[],
  registry: CreatableModuleRegistry = {},
  primary = false,
) => {
  for (const factory of factories) {
    registerCreatableModuleFactory(registry, factory, undefined, primary)
  }
  return registry
}

/** @deprecated use registerCreatableModuleFactory instead */
export const assignCreatableModuleRegistry = (
  target: CreatableModuleRegistry = {},
  ...sources: CreatableModuleRegistry[]
): CreatableModuleRegistry => {
  for (const source of sources)
    for (const [schema, factories] of Object.entries(source)) {
      if (factories) {
        const existingFactories = target[schema]
        target[schema] = existingFactories ? (target[schema] = [...existingFactories, ...factories]) : factories
      }
    }

  return target
}
