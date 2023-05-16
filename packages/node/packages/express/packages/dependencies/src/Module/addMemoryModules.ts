import { Container } from 'inversify'

import { addArchivistModuleFactories } from './Archivist'
import { addWitnessModuleFactories } from './Witness'

export const addMemoryModules = async (container: Container) => {
  // TODO: Prepare for async init
  await Promise.resolve()
  addArchivistModuleFactories(container)
  addWitnessModuleFactories(container)
}
