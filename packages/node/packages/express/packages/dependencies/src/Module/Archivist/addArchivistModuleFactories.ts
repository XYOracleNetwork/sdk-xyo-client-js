import { MemoryArchivist } from '@xyo-network/archivist'
import { CreatableModuleDictionary, ModuleFactory, ModuleFactoryLocator, toCreatableModuleRegistry } from '@xyo-network/module-model'
import { MongoDBDeterministicArchivistConfigSchema } from '@xyo-network/node-core-modules-mongo'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const getMemoryArchivistFactory = () => {
  return new ModuleFactory(MemoryArchivist, { config: { schema: MemoryArchivist.configSchema } })
}

export const addArchivistModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MongoDBDeterministicArchivistConfigSchema] = getMemoryArchivistFactory()
  dictionary[MemoryArchivist.configSchema] = getMemoryArchivistFactory()

  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  const registry = toCreatableModuleRegistry(dictionary)
  locator.registerAdditional(registry)
}
