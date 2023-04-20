import { Container } from 'inversify'

import { addWitnessConfigModuleFactories } from './Witness'

export const addMemoryModules = async (container: Container) => {
  // TODO: Prepare for async init
  await Promise.resolve()
  addWitnessConfigModuleFactories(container)
}
