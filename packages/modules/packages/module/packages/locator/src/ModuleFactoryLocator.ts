import { assertEx } from '@xylabs/assert'
import {
  CreatableModuleFactory,
  CreatableModuleRegistry,
  hasAllLabels,
  hasLabels,
  LabeledCreatableModuleFactory,
  Labels,
  registerCreatableModuleFactory,
} from '@xyo-network/module-model'
import { Schema } from '@xyo-network/payload-model'

import { standardCreatableFactories } from './standardCreatableFactories.js'

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
      // eslint-disable-next-line sonarjs/no-nested-template-literals
      () => `No module factory for the supplied ${`config schema [${schema}]`}${labels ? ` & labels [${JSON.stringify(labels)}]` : ''} registered`,
    )
  }

  merge(locator: ModuleFactoryLocator): ModuleFactoryLocator {
    return new ModuleFactoryLocator({ ...this.registry, ...locator.registry })
  }

  /**
   * Registers a single module factory (with optional tags) with the locator
   * @param factory The factory to register
   * @param labels The labels for the module factory
   */
  register(factory: CreatableModuleFactory, labels?: Labels, primary: boolean | Schema | Schema[] = false): this {
    registerCreatableModuleFactory(this._registry, factory, labels, primary)
    return this
  }

  /**
   * Registers multiple module factories with the locator
   * @param factories The factories to register
   */
  registerMany(factories: CreatableModuleFactory[]): this {
    for (const factory of factories) {
      this.register(factory)
    }
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
