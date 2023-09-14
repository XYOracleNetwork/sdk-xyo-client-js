import { MemoryArchivist } from '@xyo-network/archivist'
import { ModuleFactoryLocator } from '@xyo-network/module-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

export const addArchivistModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(MemoryArchivist)
}
