import { Container } from 'inversify'

import { addArchivistModuleFactories } from './Archivist'
import { addDivinerModuleFactories } from './Diviner'
import { JobQueueContainerModule } from './JobQueue'
import { initializeDatabase } from './Mongo'
import { addPreviousHashStore } from './PreviousHashStore'

export const addMongoModules = async (container: Container) => {
  await initializeDatabase()
  container.load(JobQueueContainerModule)
  await addArchivistModuleFactories(container)
  await addDivinerModuleFactories(container)
  addPreviousHashStore()
}
