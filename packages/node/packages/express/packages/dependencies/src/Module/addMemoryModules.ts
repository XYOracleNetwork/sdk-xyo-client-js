import { Container } from 'inversify'

import { addArchivistModuleFactories } from './Archivist'
import { addDivinerModuleFactories } from './Diviner'
import { addSentinelModuleFactories } from './Sentinel'
import { addWitnessModuleFactories } from './Witness'

export const addMemoryModules = async (container: Container) => {
  // TODO: Prepare for async init
  await Promise.resolve()
  await addArchivistModuleFactories(container)
  await addDivinerModuleFactories(container)
  await addWitnessModuleFactories(container)
  await addSentinelModuleFactories(container)
}
