import { CreatableModuleDictionary, ModuleFactory, ModuleFactoryLocator, toCreatableModuleRegistry } from '@xyo-network/module-model'
import { TYPES } from '@xyo-network/node-core-types'
import { MemorySentinel, SentinelConfigSchema } from '@xyo-network/sentinel'
import { Container } from 'inversify'

const getSentinel = () => {
  return new ModuleFactory(MemorySentinel, { config: { schema: SentinelConfigSchema } })
}

export const addSentinelModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MemorySentinel.configSchema] = getSentinel()

  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  const registry = toCreatableModuleRegistry(dictionary)
  locator.registerAdditional(registry)
}
