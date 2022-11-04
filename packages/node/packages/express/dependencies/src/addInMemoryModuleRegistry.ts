import { ModuleRegistry } from '@xyo-network/node-core-model'
import { InMemoryModuleRegistry } from '@xyo-network/node-core-modules-memory'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

export const addInMemoryModuleRegistry = (container: Container) => {
  container.bind<ModuleRegistry>(TYPES.ModuleRegistry).toConstantValue(new InMemoryModuleRegistry())
}
