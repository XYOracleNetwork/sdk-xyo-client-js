import { Container } from 'inversify'

import { addArchivistModuleFactories } from './Archivist'
import { addDivinerModuleFactories } from './Diviner'
import { addSentinelModuleFactories } from './Sentinel'
import { addWitnessModuleFactories } from './Witness'

export const addMemoryModules = async (container: Container) => {
  addArchivistModuleFactories(container)
  addDivinerModuleFactories(container)
  await addWitnessModuleFactories(container)
  await addSentinelModuleFactories(container)
}
