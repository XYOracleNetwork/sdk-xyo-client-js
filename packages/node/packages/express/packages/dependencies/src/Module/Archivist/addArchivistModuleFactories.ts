import { MemoryArchivist } from '@xyo-network/archivist'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { MongoDBDeterministicArchivistConfigSchema } from '@xyo-network/node-core-modules-mongo'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const getMongoDBArchivistFactory = () => {
  return new ModuleFactory(MemoryArchivist, {
    config: { schema: MemoryArchivist.configSchema },
  })
}

export const addArchivistModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MongoDBDeterministicArchivistConfigSchema] = getMongoDBArchivistFactory()
  dictionary[MemoryArchivist.configSchema] = getMongoDBArchivistFactory()
}
