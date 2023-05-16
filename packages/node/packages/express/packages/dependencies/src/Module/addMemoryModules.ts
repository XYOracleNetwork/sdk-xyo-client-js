import { Container } from 'inversify'

import { addWitnessModuleFactories } from './Witness'

export const addMemoryModules = async (container: Container) => {
  // TODO: Prepare for async init
  await Promise.resolve()
  addWitnessModuleFactories(container)
}
