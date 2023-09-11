import { Container } from 'inversify'

import { addArchivistModuleFactories } from './Archivist'
import { addDivinerModuleFactories } from './Diviner'
import { addSentinelModuleFactories } from './Sentinel'
import { addWitnessModuleFactories } from './Witness'

export const addMemoryModules = (container: Container) => {
  addArchivistModuleFactories(container)
  addDivinerModuleFactories(container)
  addWitnessModuleFactories(container)
  addSentinelModuleFactories(container)
}
