import type { Schema } from '@xyo-network/payload-model'

import type {
  CreatableModuleFactory, CreatableModuleRegistry, LabeledCreatableModuleFactory,
} from './CreatableModule/index.ts'
import type { Labels } from './Labels/index.ts'

export interface ModuleFactoryLocatorInstance {

  /**
   * The current registry for the module factory
   */
  registry: Readonly<CreatableModuleRegistry>

  freeze(): void

  /**
   * Locates a module factory that matches the supplied schema and labels
   * @param schema The config schema for the module
   * @param labels The labels for the module factory
   * @returns A module factory that matches the supplied schema and labels or throws if one is not found
   */
  locate(schema: string, labels?: Labels): CreatableModuleFactory | LabeledCreatableModuleFactory

  merge(locator: ModuleFactoryLocatorInstance): ModuleFactoryLocatorInstance

  /**
   * Registers a single module factory (with optional tags) with the locator
   * @param factory The factory to register
   * @param labels The labels for the module factory
   */
  register(factory: CreatableModuleFactory, labels?: Labels, primary?: boolean | Schema | Schema[]): ModuleFactoryLocatorInstance

  /**
   * Registers multiple module factories with the locator
   * @param factories The factories to register
   */
  registerMany(factories: CreatableModuleFactory[]): ModuleFactoryLocatorInstance

  /**
   * Tries to locate a module factory that matches the supplied schema and labels
   * @param schema The config schema for the module
   * @param labels The labels for the module factory
   * @returns A module factory that matches the supplied schema and labels or undefined
   */
  tryLocate(schema: string, labels?: Labels): CreatableModuleFactory | LabeledCreatableModuleFactory | undefined
}
