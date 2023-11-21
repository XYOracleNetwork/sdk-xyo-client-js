import { ModuleFactoryLocator } from '@xyo-network/module-model'
import { TYPES } from '@xyo-network/node-core-types'
import { MemorySentinel } from '@xyo-network/sentinel'
import { Container } from 'inversify'

export const addSentinelModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(MemorySentinel)
}
