import { assertEx } from '@xylabs/assert'

import { hasAllLabels, Labels } from '../Labels'
import { CreatableModuleFactory } from './CreatableModule'
import { CreatableModuleRegistry } from './CreatableModuleRegistry'
import { hasLabels, LabeledCreatableModuleFactory } from './LabeledCreatableModuleFactory'

/**
 * A class which encapsulates the Service Locator Pattern for Module Factories
 */
export class ModuleFactoryLocator {
  constructor(protected readonly _registry: CreatableModuleRegistry = {}) {}

  /**
   * The current registry for the module factory
   */
  get registry(): Readonly<CreatableModuleRegistry> {
    return this._registry
  }

  /**
   * Locates a module factory that matches the supplied schema and labels
   * @param schema The config schema for the module
   * @param labels The labels for the module factory
   * @returns A module factory that matches the supplied schema and labels or throws if one is not found
   */
  locate(schema: string, labels?: Labels): CreatableModuleFactory | LabeledCreatableModuleFactory {
    return assertEx(this.tryLocate(schema, labels), () => {
      const configString = `config schema [${schema}]`
      const labelsString = labels ? ` & labels [${JSON.stringify(labels)}]` : ''
      return `No module factory for the supplied ${configString}${labelsString} registered`
    })
  }

  /**
   * Registers a single module factory (with optional tags) with the locator
   * @param additional Additional module factories to register
   */
  register(mod: CreatableModuleFactory | LabeledCreatableModuleFactory, labels?: Labels): this {
    mod.configSchemas.map((schema) => {
      const existingFactories = this._registry[schema]
      const factory: LabeledCreatableModuleFactory = {
        ...mod,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: mod.create.bind(mod) as any,
        labels: Object.assign({}, (mod as LabeledCreatableModuleFactory).labels ?? {}, labels ?? {}),
      }
      this._registry[schema] = existingFactories ? [...existingFactories, factory] : [factory]
    })
    return this
  }

  /**
   * Registers multiple module factories with the locator
   * @param additional Additional module factories to register
   */
  registerMany(additional: CreatableModuleRegistry): this {
    Object.entries(additional).map(([schema, factories]) => {
      if (factories) {
        const existingFactories = this._registry[schema]
        this._registry[schema] = existingFactories ? [...existingFactories, ...factories] : factories
      }
    })
    return this
  }

  /**
   * Tries to locate a module factory that matches the supplied schema and labels
   * @param schema The config schema for the module
   * @param labels The labels for the module factory
   * @returns A module factory that matches the supplied schema and labels or undefined
   */
  tryLocate(schema: string, labels?: Labels): CreatableModuleFactory | LabeledCreatableModuleFactory | undefined {
    // If labels were provided
    return labels
      ? // Find the first factory that has labels and has all the labels provided
        this._registry[schema]?.filter(hasLabels).find((factory) => hasAllLabels(factory?.labels, labels))
      : // Otherwise, return the first factory
        this._registry[schema]?.[0]
  }
}
