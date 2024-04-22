import { assertEx } from '@xylabs/assert'
import {
  AttachableModuleInstance,
  CreatableModuleFactory,
  CreatableModuleRegistry,
  hasAllLabels,
  hasLabels,
  LabeledCreatableModuleFactory,
  Labels,
} from '@xyo-network/module-model'
import { Schema } from '@xyo-network/payload-model'

import { standardCreatableFactories } from './standardCreatableFactories'

/**
 * A class which encapsulates the Service Locator Pattern for Module Factories
 */
export class ModuleFactoryLocator {
  constructor(protected readonly _registry: CreatableModuleRegistry = standardCreatableFactories()) {}

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
    return assertEx(
      this.tryLocate(schema, labels),
      () => `No module factory for the supplied ${`config schema [${schema}]`}${labels ? ` & labels [${JSON.stringify(labels)}]` : ''} registered`,
    )
  }

  /**
   * Registers a single module factory (with optional tags) with the locator
   * @param additional Additional module factories to register
   */
  register(mod: CreatableModuleFactory, labels?: Labels): this {
    this.registerOne(mod, mod.defaultConfigSchema, labels, true)
    mod.configSchemas.map((schema) => {
      this.registerOne(mod, schema, labels, false)
    })
    return this
  }

  /**
   * Registers multiple module factories with the locator
   * @param additional Additional module factories to register
   */
  registerMany(mods: CreatableModuleFactory[]): this {
    for (const mod of mods) {
      this.register(mod)
    }
    return this
  }

  /**
   * Registers a single module factory (with optional tags) with the locator & a specific schema
   * @param additional Additional module factories to register
   */
  registerOne<TModule extends AttachableModuleInstance>(
    mod: CreatableModuleFactory<TModule>,
    schema: Schema,
    labels?: Labels,
    primary = false,
  ): this {
    const existingFactories = this._registry[schema]
    const factory: LabeledCreatableModuleFactory<TModule> = {
      // Destructure instance properties
      ...mod,
      // Copy static methods
      create: mod.create.bind(mod) as LabeledCreatableModuleFactory<TModule>['create'],
      // Merge module & supplied labels
      labels: Object.assign({}, (mod as LabeledCreatableModuleFactory).labels ?? {}, labels ?? {}),
    }
    this._registry[schema] = primary ? [factory, ...(existingFactories ?? [])] : [...(existingFactories ?? []), factory]
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
    return labels ?
        // Find the first factory that has labels and has all the labels provided
        this._registry[schema]?.filter(hasLabels).find((factory) => hasAllLabels(factory?.labels, labels))
      : // Otherwise, return the first factory
        this._registry[schema]?.[0]
  }
}
