import { assertEx } from '@xylabs/assert'
import type {
  CreatableModuleFactory,
  CreatableModuleRegistry,
  LabeledCreatableModuleFactory,
  Labels,
  ModuleFactoryLocatorInstance,
} from '@xyo-network/module-model'
import {
  hasAllLabels,
  hasLabels,
  registerCreatableModuleFactory,
} from '@xyo-network/module-model'
import type { Schema } from '@xyo-network/payload-model'

import { standardCreatableFactories } from './standardCreatableFactories.ts'

/**
 * A class which encapsulates the Service Locator Pattern for Module Factories
 */
export class ModuleFactoryLocator implements ModuleFactoryLocatorInstance {
  private _frozen = false

  constructor(protected readonly _registry: CreatableModuleRegistry = standardCreatableFactories()) {}

  /**
   * The current registry for the module factory
   */
  get registry(): Readonly<CreatableModuleRegistry> {
    return this._registry
  }

  static empty() {
    return new ModuleFactoryLocator({})
  }

  static standard() {
    return new ModuleFactoryLocator(standardCreatableFactories())
  }

  freeze() {
    this._frozen = true
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
      () => `No module factory for the supplied config schema [${schema}]${labels ? ` & labels [${JSON.stringify(labels)}]` : ''} registered`,
    )
  }

  merge(locator: ModuleFactoryLocatorInstance): ModuleFactoryLocatorInstance {
    const registry = { ...this.registry }
    for (const schema in locator.registry) {
      if (registry[schema]) {
        registry[schema].push(...(locator.registry[schema] ?? []))
      } else {
        registry[schema] = locator.registry[schema]
      }
    }
    return new ModuleFactoryLocator(registry)
  }

  /**
   * Registers a single module factory (with optional tags) with the locator
   * @param factory The factory to register
   * @param labels The labels for the module factory
   */
  register(factory: CreatableModuleFactory, labels?: Labels, primary: boolean | Schema | Schema[] = false): this {
    assertEx(!this._frozen, () => 'Cannot register a module factory after the locator has been frozen')
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
    return labels
      // Find the first factory that has labels and has all the labels provided
      ? (this._registry[schema]?.filter(hasLabels).find(factory => hasAllLabels(factory?.labels, labels)) ?? this._registry[schema]?.[0])
      // Otherwise, return the first factory
      : this._registry[schema]?.[0]
  }
}
