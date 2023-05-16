import { Container } from 'inversify'

import { addArchivistModuleFactories } from './Archivist'
import { addDivinerModuleFactories } from './Diviner'
import { addWitnessModuleFactories } from './Witness'

export const addMemoryModules = async (container: Container) => {
  // TODO: Prepare for async init
  await Promise.resolve()
  addArchivistModuleFactories(container)
  addDivinerModuleFactories(container)
  addWitnessModuleFactories(container)
}
